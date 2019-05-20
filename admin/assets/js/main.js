jQuery.noConflict();
(function(scoped) {
    scoped(window.jQuery, window.L, window, document)
}(function($, L, W, D) {
    //'use strict'

    var ie = /msie ([0-9]+)\.[0-9]+/.exec(navigator.userAgent.toLowerCase()),
        GATEKEEPER_KEY = 'f2e3e82987f8a1ef78ca9d9d3cfc7f1d',
        CITY_HALL = [39.95262, -75.16365],
        ZOOM = 13,
        ZOOM2 = 19,
        BASEMAP1 = '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap/MapServer',
        BASEMAP1_LABELS = '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap_Labels/MapServer',
        BASEMAP2 = '//services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer',
        baseUri=W.baseUri,
        Markers = [],
        Shapes = [],
        CustomShapes = [],
        VoterShapes = [],
        AddressData = [],
        GrouperContext = [],
        LastAddressComplete = [],
        AllIndexes = [],
        FeatureGroup,
        Lmap,
        geocoder,
        mayorAddress,
        endMarker,
        wardDivision,
        searchBox,
        divisions,
        wards,
        councilDistricts,
        stateRepDistricts,
        stateSenateDistricts,
        usCongressDistricts,
        officeToId = {
            'President of the United States': '#potus',
            'U.S. Senate': '#us-senators',
            'U.S. Representative': '#us-representative',
            'Governor': '#governor',
            'Lieutenant Governor': '#lieutenant-governor',
            'Attorney General': '#attorney-general',
            'State Treasurer': '#state-treasurer',
            'Auditor General': '#auditor-general',
            'State Senator': '#state-senator',
            'State Representative': '#state-representative',
            'Mayor': '#mayor',
            'District Attorney': '#district-attorney',
            'City Controller': '#city-controller',
            'Register of Wills': '#register-of-wills',
            'Sheriff': '#sheriff',
            'City Commissioner': '#city-commissioners',
            'City Council At-Large': '#city-council-at-large',
            'City Council': '#city-council'
        },
        buildingCodes = {
            'F': 'BUILDING FULLY ACCESSIBLE',
            'A': 'ALTERNATE ENTRANCE',
            'B': 'BUILDING SUBSTANTIALLY ACCESSIBLE',
            'R': 'ACCESSIBLE WITH RAMP',
            'M': 'BUILDING ACCESSIBLITY MODIFIED',
            'N': 'BUILDING NOT ACCESSIBLE'
        },
        parkingCodes = {
            'N': 'NO PARKING',
            'L': 'LOADING ZONE',
            'H': 'HANDICAP PARKING',
            'G': 'GENERAL PARKING'
        },
        Icons = {
            home: L.icon({
                iconUrl: 'components/com_pvdemos/assets/images/b.png',
                iconSize: [32, 32],
                iconAnchor: [16, 32]
            }),
            polling: L.icon({
                iconUrl: 'components/com_pvdemos/assets/images/polling.png',
                iconSize: [32, 37],
                iconAnchor: [16, 37]
            }),
            congress: L.icon({
                iconUrl: 'components/com_pvdemos/assets/images/congress.png',
                iconSize: [32, 37],
                iconAnchor: [16, 37]
            }),
            entrance: L.icon({
                iconUrl: 'components/com_pvdemos/assets/images/e.png',
                iconSize: [24, 24],
            }),
            handi: L.icon({
                iconUrl: 'components/com_pvdemos/assets/images/h.png',
                iconSize: [24, 24],
            })
        },
        shared_params = 'outFields=*&callback=?&outSR=4326&returnCentroid=true&f=pjson&',
        Services = {
            address_completer: {
                url: function(input) {
                    const encInput = encodeURIComponent(input);
                    return '//cloudapis3.philadelphiavotes.com/autocomplete/{encInput}'.replace('{encInput}', encInput);
                }
            },
            geocoder: {
                url: function(input) {
                    const encInput = encodeURIComponent(input);
                    return '//api.phila.gov/ais/v1/search/{encInput}'.replace('{encInput}', encInput);
                },
                params: {
                    gatekeeperKey: GATEKEEPER_KEY
                },
                style: {
                    color: '#FF0000',
                }
            },
            indexer: {
                url: function(input) {
                    const encInput = encodeURIComponent(pad(input, 4));
                    return '//cloudapis3.philadelphiavotes.com/indexes/{encInput}'.replace('{encInput}', encInput);
                }
            },
            indexer_list: {
                url: function(input) {
                    const encInput = encodeURIComponent(pad(input, 4));
                    return '//cloudapis3.philadelphiavotes.com/indexes/list/{encInput}'.replace('{encInput}', encInput);
                }
            },
            old_indexer: {
                url: function(input) {
                    const encInput = encodeURIComponent(pad(input, 4));
                    return '//cloudapis3.philadelphiavotes.com/old_indexes/{encInput}'.replace('{encInput}', encInput);
                }
            },
            old_indexer_list: {
                url: function(input) {
                    const encInput = encodeURIComponent(pad(input, 4));
                    return '//cloudapis3.philadelphiavotes.com/old_indexes/list/{encInput}'.replace('{encInput}', encInput);
                }
            },
            polling_place: {
                url: function(input) {
                    const encInput = encodeURIComponent(pad(input, 4));
                    return '//cloudapis3.philadelphiavotes.com/pollingplaces/{encInput}'.replace('{encInput}', encInput);
                },
                style: {
                    color: '#FF0000'
                }
            },
            shape_city_division_them: {
                url: function(input) {
                    const encInput = encodeURIComponent(pad(input, 4));
                    return '//services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/Political_Divisions/FeatureServer/0/query?{params}where=DIVISION_NUM={encInput}'.replace('{encInput}', encInput).replace('{params}', shared_params);
                },
                style: {
                    color: '#FF0000'
                },
                properties: {
                    prefix: 'D'
                }
            },
            shape_city_ward_them: {
                url: function(input) {
                    const encInput = encodeURIComponent(parseInt(input, 10));
                    return '//services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/Political_Wards/FeatureServer/0/query?{params}where=WARD_NUM={encInput}'.replace('{encInput}', encInput).replace('{params}', shared_params);
                },
                style: {
                    color: '#0000FF'
                },
                properties: {
                    prefix: 'W'
                }
            },
            shape_city_district_them: {
                url: function(input) {
                    const encInput = encodeURIComponent(parseInt(input, 10));
                    return '//services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/Council_Districts_2016/FeatureServer/0/query?{params}where=DISTRICT={encInput}'.replace('{encInput}', encInput).replace('{params}', shared_params);
                },
                style: {
                    color: '#0D912E'
                },
                properties: {
                    prefix: 'CD'
                }
            },
            shape_state_house_them: {
                url: function(input) {
                    const encInput = encodeURIComponent(parseInt(input, 10));
                    return '//services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/State_House_Rep_2012/FeatureServer/0/query?{params}where=DISTRICT_NUMBER={encInput}'.replace('{encInput}', encInput).replace('{params}', shared_params);
                },
                style: {
                    color: '#751675'
                },
                properties: {
                    prefix: 'SR'
                }
            },
            shape_state_senate_them: {
                url: function(input) {
                    const encInput = encodeURIComponent(parseInt(input, 10));
                    return '//services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/State_Senate_2012/FeatureServer/0/query?{params}where=DISTRICT_NUMBER={encInput}'.replace('{encInput}', encInput).replace('{params}', shared_params);
                },
                style: {
                    color: '#875010'
                },
                properties: {
                    prefix: 'SS'
                }
            },
            shape_federal_house_them: {
                url: function(input) {
                    const encInput = encodeURIComponent(pad(input));
                    return '//services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/US_Congressional_2018/FeatureServer/0/query?{params}where=DISTRICT={encInput}'.replace('{encInput}', encInput).replace('{params}', shared_params);
                },
                style: {
                    color: '#0C727D'
                },
                properties: {
                    prefix: 'USC'
                }
            },
            shape_federal_house_them_old: {
                url: function(input) {
                    const encInput = encodeURIComponent(pad(input));
                    return '//services.arcgis.com/fLeGjb7u4uXqeF9q/arcgis/rest/services/US_Congressional_2012/FeatureServer/0/query?{params}where=DISTRICT_NUMBER={encInput}'.replace('{encInput}', encInput).replace('{params}', shared_params);
                },
                style: {
                    color: '#1cc'
                },
                properties: {
                    prefix: 'USCO'
                }
            },
            shape_city_division: {
                url: function(input) {
                    const encInput = encodeURIComponent(pad(input, 4));
                    return '//cloudapis3.philadelphiavotes.com/shapes/city_division/{encInput}'.replace('{encInput}', encInput);
                },
                style: {
                    color: '#ff02ff'
                },
                properties: {
                    prefix: 'DO'
                }
            },
            shape_city_ward: {
                url: function(input) {
                    const encInput = encodeURIComponent(parseInt(input, 10));
                    return '//cloudapis3.philadelphiavotes.com/shapes/city_ward/{encInput}'.replace('{encInput}', encInput);
                },
                style: {
                    color: '#0000FF'
                }
            },
            shape_city_district: {
                url: function(input) {
                    const encInput = encodeURIComponent(parseInt(input, 10));
                    return '//cloudapis3.philadelphiavotes.com/shapes/city_district/{encInput}'.replace('{encInput}', encInput);
                },
                style: {
                    color: '#0D912E'
                }
            },
            shape_state_house: {
                url: function(input) {
                    const encInput = encodeURIComponent(parseInt(input, 10));
                    return '//cloudapis3.philadelphiavotes.com/shapes/state_house/{encInput}'.replace('{encInput}', encInput);
                },
                style: {
                    color: '#751675'
                }
            },
            shape_state_senate: {
                url: function(input) {
                    const encInput = encodeURIComponent(parseInt(input, 10));
                    return '//cloudapis3.philadelphiavotes.com/shapes/state_senate/{encInput}'.replace('{encInput}', encInput);
                },
                style: {
                    color: '#875010'
                }
            },
            shape_federal_house: {
                url: function(input) {
                    const encInput = encodeURIComponent(pad(input));
                    return '//cloudapis3.philadelphiavotes.com/shapes/federal_house/42{encInput}'.replace('{encInput}', encInput);
                },
                style: {
                    color: '#0C727D'
                }
            }
        };


    // begin ajax functions
    function addressComplete() {
console.log('in addressComplete');

        if (!searchBox) return false;
        $(searchBox).autocomplete({
            minLength: 3,
            source: function(request, callback) {
                var service = Services.address_completer,
                    space = request.term.indexOf(' ')
                // let's not run until we've entered a street number
                // and the first letter of the street
                if (space > 0 && space < request.term.length - 1) {
                    $.getJSON(service.url(request.term), service.params, function(response) {
                        if (response.status == "success") {
                            var addresses = $.map(response.data, function(candidate) {
                                return {
                                    label: candidate.address,
                                    value: candidate.address,
                                    precinct: candidate.precinct,
                                    zip: candidate.zip
                                }
                            })
                            callback(addresses)
                        } else {
                            callback([])
                        }
                    })
                }
            },
            select: function(evt, ui) {
                LastAddressComplete = ui.item
                searchBox.value = ui.item.label
                addressEntered()
            }
        })
    }

    function addressNotEntered() {
console.log('in addressNotEntered');

        if (!searchBox || !searchBox.value) {
            return false;
        }

        if (!wardDivision) {
            invalidAddress();
            return false;
        }

        if (!AllIndexes.length) {
/*            setIndexes();*/
        } else {
/*            tabFunc();*/
        }
    }

    function addressEntered(message) {
console.log('in addressEntered');

        if (!searchBox || !searchBox.value) {
            return false;
        }
        var enteredAddress,
            getHome,
            icon,
            marker,
            coords = [],
            coordsString;
        // reset AddressData and related
        wardDivision = null;
        AllIndexes = [];
        VoterShapes = [];
        AddressData = [];
        clearShapes();
        clearMarkers();
        AddressData.home = null;
        service = Services.geocoder;

        if (!searchBox.value) {
            invalidAddress();
            return;
        }
        enteredAddress = searchBox.value;
        icon = baseUri + 'components/com_pvdemos/assets/images/home.png';
        if (message == '1') {
            getHome = getPhilaAddressData(enteredAddress)
        } else {
            getHome = getPhilaAddressData(LastAddressComplete.label + ', ' + LastAddressComplete.zip);
        }
        getHome.done(function(data) {
            var i = 0,
                customAddressTables = '<table width=" 100%" cellspacing="0" cellpadding="3" id="multiple_address_tbl">',
                customAddressTablesFullMarks = '<table width=" 100%" cellspacing="0" cellpadding="3" id="multiple_address_tbl">';
            $.each(data.features, function(idx, feature) {
                customAddressTables += '<tr><td><input type="radio" name="address_vals" value="' + feature.properties.street_address + '">' + feature.properties.street_address + '</td></tr>';
                if (feature.match_type = 'exact') {
                    i++;
                    customAddressTablesFullMarks += '<tr><td><input type="radio" name="address_vals" value="' + feature.properties.street_address + '">' + feature.properties.street_address + '</td></tr>';
                }
            });
            customAddressTables += '<tr><td><input type="radio" name="address_vals" value="-1">None of the Above</td></tr>';
            customAddressTables += '</table>';
            customAddressTablesFullMarks += '<tr><td><input type="radio" name="address_vals" value="-1">None of the Above</td></tr>';
            customAddressTablesFullMarks += '</table>';
            if (i == 0 || i > 1) {
                if (i > 1) {

                    popupFunctionAddress(data, service, icon, enteredAddress, customAddressTablesFullMarks);
                } else {
                    popupFunctionAddress(data, service, icon, enteredAddress, customAddressTables);
                }
            } else {
                for (var ii = 0; ii <= data.features.length - 1; ii++) {
                    var feature = data.features[ii];
                    if (feature.match_type === 'exact') {
                        var temp = feature.properties.election_precinct || feature.properties.political_division;
                        if (temp.split('-').length > 1) temp = temp.split('-')[0]
                        wardDivision = temp;
                        GrouperContext = ['home', 'pollingplace', wardDivision.toString()]
/*                        setIndexes();*/
                        AddressData.home = makeAddressDataElement(feature, service, enteredAddress)
                        Markers.home = L.marker(AddressData.home.coordinates, {
                            icon: Icons.home,
                        });
                        writeGeocoding();
                    }
                }
                if (!wardDivision || data.features.length === 0) {
                    invalidAddress();
                }
            }
        }).then(function(){
            GrouperContext = 'one.up'
            setTimeout(grouper, 500);
        }).fail(invalidAddress);
    }

    function popupFunctionAddress(data, service, icon, enteredAddress, content) {
console.log('in popupFunctionAddress');

        $('#multiple_address_tbl').html(content);
        $('#cstm-score-address-popup').dialog({
            modal: true,
            buttons: {
                Ok: function() {
                    if ($('[name="address_vals"]').is(':checked')) {
                        var checkedInputVal = $('input:radio[name=address_vals]:checked').val();
                        $('#cstm-score-address-popup').dialog('close');
                        if (checkedInputVal == '-1') {
                            $('#target').val('');
                        } else {
                            $.each(data.features, function(idx, feature) {
                                if (checkedInputVal == feature.properties.street_address) {
                                    wardDivision = feature.properties.election_precinct || feature.properties.political_division;
                                    GrouperContext = ['home', 'pollingplace', wardDivision.toString()]

                                    AddressData.home = makeAddressDataElement(feature, service, checkedInputVal);
                                    $('#target').val(checkedInputVal);
                                    Markers.home = L.marker(AddressData.home.coordinates, {
                                        icon: Icons.home,
                                    });
                                }
                            });
                            if (!wardDivision || data.features.length === 0) {
                                invalidAddress();
                            } else {
                                addressNotEntered();
                            }
                        }
                    } else {
                        var tips = $('.validateTips');
                        tips.text('Please select at least one Address').addClass('ui-state-highlight');
                        setTimeout(function() {
                            tips.removeClass('ui-state-highlight', 1000);
                        }, 650);
                    }
                }
            }
        });
    }


    function writeGeocoding() {
      console.log(wardDivision, AddressData.home)

    }

    function getPhilaAddressData(input) {
console.log('in getPhilaAddressData');

        var deferred = $.Deferred(),
            service = Services.geocoder,
            addresses = []
        $.getJSON(service.url(input), service.params).done(function(response) {
            deferred.resolve(response)
        }).fail(function(response) {
            deferred.reject(response);
        });

        return deferred.promise()
    }

    function makeAddressDataElement(feature, service, input) {
console.log('in makeAddressDataElement');

        return {
            coordinates: [feature.geometry.coordinates[1], feature.geometry.coordinates[0]],
            style: service.style,
            data: feature.properties,
            name: input
        }
    }

    function getShapeFromService(input, service) {
console.log('in getShapeFromService');

        var deferred = $.Deferred()
        $.getJSON(service.url(input), service.params).done(function(response) {
            var poly, area, centroid;
            if (response.features) {
                if ("undefined" == typeof response.features[0].centroid || !response.features[0].centroid) {
                    poly = poly || turf.polygon([response.features[0].geometry.rings[0]]);
                    centroid = turf.centroid(poly)
                } else {
                    centroid = response.features[0].centroid
                }
                if ("undefined" == typeof response.features[0].attributes.Shape___Area || !response.features[0].attributes.Shape___Area) {
                    poly = poly || turf.polygon([response.features[0].geometry.rings[0]]);
                    area = turf.area(poly)
                } else {
                    area = response.features[0].attributes.Shape___Area
                }
                data = {
                    geoJSON: {
                        type: "Feature",
                        properties: {
                            name: input,
                            prefix: service.properties.prefix,
                            area: area
                        },
                        geometry: {
                            type: "Polygon",
                            coordinates: [response.features[0].geometry.rings[0]]
                        },
                        centroid: centroid
                    },
                    style: {
                        color: service.style.color
                    }
                }
                deferred.resolve(data);
            } else {
                deferred.reject(response)
            }
        })
        return deferred.promise()
    }

    function getIndexes(input) {
console.log('in getIndexes');

        var deferred = $.Deferred(),
            service = Services.indexer;
        $.getJSON(service.url(input), service.params).done(function(data) {
            if (data.features) {
                deferred.resolve(data);
            } else {
                deferred.reject();
            }
        }).fail(function(data) {
            deferred.reject();
        });
        return deferred.promise();
    }

    // end ajax functions

    // map functions
    function removeBasemaps() {
console.log('in removeBasemaps');

        Lmap.eachLayer(function(layer) {
            Lmap.removeLayer(layer);
        });
    }

    function setDefaultBasemaps() {
console.log('in setDefaultBasemaps');

        removeBasemaps()
        if (BASEMAP1) {
            L.esri.tiledMapLayer({
                url: BASEMAP1
            }).addTo(Lmap)
        }
        if (BASEMAP1_LABELS) {
            L.esri.tiledMapLayer({
                url: BASEMAP1_LABELS
            }).addTo(Lmap)
        }
    }

    function setAlternateBasemaps() {
console.log('in setAlternateBasemaps');

        removeBasemaps()
        if (BASEMAP2) {
            L.esri.tiledMapLayer({
                url: BASEMAP2
            }).addTo(Lmap)
        }
    }

    function clearShapes() {
console.log('in clearShapes');

        for (var prop in Shapes) {
            if (!Shapes.hasOwnProperty(prop)) continue;
            Lmap.removeLayer(Shapes[prop]);
            Shapes[prop].up = false
        }
    }

    function clearMarkers(justOne) {
console.log('in clearMarkers');

        // if justOne is set, we clear Markers[justOne], if it exists
        if (justOne && 'undefined' !== typeof Markers[justOne]) {
            Lmap.removeLayer(Markers[justOne]);
            return
        }
        Object.keys(Markers).forEach(function(idx, item) {
            Lmap.removeLayer(Markers[idx]);
            Markers[idx].up = false
        });

    }

    function drawShape(shape, label) {
console.log('in drawShape');

        Shapes[shape.geoJSON.properties.name] = L.geoJSON(shape.geoJSON, shape.style);
        Shapes[shape.geoJSON.properties.name]['up'] = true;
    }

    function drawShapes(shapesToDraw) {
console.log('in drawShapes');

        for (var prop in shapesToDraw) {
            if (!shapesToDraw.hasOwnProperty(prop)) continue;
            drawShape(shapesToDraw[prop], prop);
        }
        setTimeout(grouper, 1000);
    }
    // end map functions

    function addDistrictToList(element, content, value, set) {
console.log('in addDistrictToList');

        element.append($('<option />').text(content).val(value).prop('disabled', !!set));
    }

    function tabFunc() {
console.log('in tabFunc');

        return tabFunctions[getActive()]();
    }

    function getActive() {
console.log('in getActive');

        return $('#nav').find('li.active').attr('id')
    }

    // my utils
    // specify markers or set Markers
    function grouper() {
console.log('in grouper');

        var features = [],
            props = [];

        for (var prop in Markers) {
            if (!Markers.hasOwnProperty(prop)) continue;
            var feature = Markers[prop];
            if ((GrouperContext == 'all.up' && feature.up) || GrouperContext.indexOf(prop) > -1 || GrouperContext == 'one.up') {
                feature.up = true;
                feature.addTo(Lmap);
                props.push(prop);
                features.push(feature);
            }
        }
        for (var prop in Shapes) {
            if (!Shapes.hasOwnProperty(prop)) continue;
            var feature = Shapes[prop],
                properties;
            for (var p in feature._layers) {
                if (!feature._layers.hasOwnProperty(p)) continue;
                properties = feature._layers[p].feature.properties;
            }

            if (((GrouperContext == 'all.up') && feature.up) || GrouperContext.indexOf(prop) > -1) {
                feature.up = true;
                feature.addTo(Lmap);
                /*
                    feature.bindTooltip('<span style="font-size: 8px;">' + prop + '</span>', {
                        className: "shape-label-" + properties.prefix,
                        permanant: true,
                        direction: "center"
                    }).openTooltip();
                */
                props.push(prop);
                features.push(feature);
            } else if (((GrouperContext == 'my.up') && feature.up) || GrouperContext.indexOf(prop) > -1) {
                feature.up = true;
                feature.addTo(Lmap);
                /*
                    feature.bindTooltip('<span style="font-size: 8px;">' + prop + '</span>', {
                        className: "shape-label-" + properties.prefix,
                        permanant: true,
                        direction: "center"
                    }).openTooltip();
                */
                props.push(prop);
                features.push(feature);
            }
        }

        if (GrouperContext == 'all.up' || GrouperContext == 'my.up') {
            FeatureGroup = new L.featureGroup(features);
            Lmap.fitBounds(FeatureGroup.getBounds());
        } else if (GrouperContext == 'one.up') {
          console.log('one.up group')
            Lmap.setView(Markers.home._latlng, ZOOM2)
        } else if (isEqual(props, GrouperContext)) {
            FeatureGroup = new L.featureGroup(features);
            Lmap.fitBounds(FeatureGroup.getBounds());
        } else {
            // not all, not specifically in GrouperContext
        }
    }

    function invalidAddress() {
console.log('in invalidAddress');

        wardDivision = '';
        //if (!searchBox || !searchBox.value) return
        alert('The address you have chosen is invalid. Please select an address in Philadelphia.');
    }

    function clearCustomMap() {
console.log('in clearCustomMap');

        $('.custom-map-selector').val([]).change();
    }

    function showBallotDropdown() {
console.log('in showBallotDropdown');

        var b = $('#ballots_dropdown').val();
        if (b != '') {
            var a = baseUri + 'ballot_paper/' + b + '.pdf';
            var c = W.open(a, '_blank');
            c.focus();
        } else {
            alert();
        }
    }

    // utils
    $.support.cors = true;

    String.prototype.toProperCase = function() {
        return this.replace(/\w\S*/g, function(a) {
            return a.charAt(0).toUpperCase() + a.substr(1).toLowerCase();
        });
    };

    function getHash() {
console.log('in getHash');

        return W.location.hash.substring(1);
    }

    function isEqual(value, other) {
console.log('in isEqual');


        // Get the value type
        var type = Object.prototype.toString.call(value);

        // If the two objects are not the same type, return false
        if (type !== Object.prototype.toString.call(other)) return false;

        // If items are not an object or array, return false
        if (['[object Array]', '[object Object]'].indexOf(type) < 0) return false;

        // Compare the length of the length of the two items
        var valueLen = type === '[object Array]' ? value.length : Object.keys(value).length;
        var otherLen = type === '[object Array]' ? other.length : Object.keys(other).length;
        if (valueLen !== otherLen) return false;

        // Compare two items
        var compare = function(item1, item2) {

            // Get the object type
            var itemType = Object.prototype.toString.call(item1);

            // If an object or array, compare recursively
            if (['[object Array]', '[object Object]'].indexOf(itemType) >= 0) {
                if (!isEqual(item1, item2)) return false;
            }

            // Otherwise, do a simple comparison
            else {

                // If the two items are not the same type, return false
                if (itemType !== Object.prototype.toString.call(item2)) return false;

                // Else if it's a function, convert to a string and compare
                // Otherwise, just compare
                if (itemType === '[object Function]') {
                    if (item1.toString() !== item2.toString()) return false;
                } else {
                    if (item1 !== item2) return false;
                }

            }
        };

        // Compare properties
        if (type === '[object Array]') {
            for (var i = 0; i < valueLen; i++) {
                if (compare(value[i], other[i]) === false) return false;
            }
        } else {
            for (var key in value) {
                if (value.hasOwnProperty(key)) {
                    if (compare(value[key], other[key]) === false) return false;
                }
            }
        }

        // If nothing failed, return true
        return true;
    }

    function coordsSwap(coords) {
console.log('in coordsSwap');

        return [coords[1], coords[0]]
    }

    function coordsSwapAll(coords) {
console.log('in coordsSwapAll');

        var tmp = []
        for (var i = 0; i < coords.length - 1; i++) {
            tmp.push([coords[i][1], coords[i][0]])
        }
        return tmp
    }

    function pad(n, width, z) {
console.log('in pad');

        n = n + '' // cast to string
        z = z || '0' // default padding: '0'
        width = width || 2 // default digits: 2
        return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n
    }

    function s4() {
console.log('in s4');

        return Math.floor((1 + Math.random()) * 65536).toString(16).substring(1);
    }

    function guid() {
console.log('in guid');

        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }

    function getQueryParams(qs) {
console.log('in getQueryParams');

        qs = qs.split('+').join(' ');

        var params = {},
            tokens,
            re = /[?&]?([^=]+)=([^&]*)/g;

        while (tokens = re.exec(qs)) {
            params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
        }

        return params;
    }

    function onhashChange() {
console.log('in onhashChange');

        switch (getHash()) {
            case 'elected-officials':
                showTabElectedOfficials();
                break;
            case 'polling-place':
                showTabPollingplace();
                break;
            case 'my-maps':
                showTabMyMaps();
                break;
            case 'maps':
                showTabMaps();
                break;
            case 'ballots':
                showTabBallot();
                break;
        }
    }

    function CN() {
console.log('in CN');


        if (0) {
            return '';
        }
        var re = /function (.*?)\(/;
        var s = CN.caller.toString();
        var m = re.exec(s);
        return (m[1]);
    }

    // events

    if (D.addEventListener) {
        W.addEventListener('hashchange', onhashChange, false);
    } else if (D.attachEvent) {
        W.attachEvent('onhashchange', onhashChange);
    }

    // explicit typed search
    $(D).on('keydown', '#target', function(event) {
        if (event.key === 'Enter' && searchBox.value) {
            LastAddressComplete = [];
            addressEntered(1)
        }
    });

    // explicit clicked search
    $(D).on('click', '#geocodeme', function(event) {
        searchBox.value = $('#address_street').val();
        LastAddressComplete = [];
        addressEntered(1)
    });

    // overcome chrome autocomplete
    $(D).on('mouseup keyup','#target', function () {
        var val = $('#target').val();
        val = val.length;
        if (val === 0) {
            $('#target').attr('autocomplete', 'on');
        }
        else {
            $('#target').attr('autocomplete', 'new-password');
        }
    }).on('mousedown keydown','#target', function () {
        var val = $('#target').val();
        var length = val.length;
        if (!length) {
            $('#target').attr('autocomplete', 'new-password');
        }
    });

    // init
    $(function() {
        // ui setup actions
        $('.office-level-accordion > dd').hide();
        $('.office-accordion > dd').hide();

        // Lmap setup
        D.getElementById('map-canvas').style.zIndex = 1
        Lmap = L.map('map-canvas').setView(CITY_HALL, ZOOM)
        Lmap.options.minZoom = 11

        // map events setup
        Lmap.on('zoom', function(e) {});

        // set up layers
        setDefaultBasemaps();
        //setAlternateBasemaps()

        L.control.browserPrint().addTo(Lmap)
        searchBox = D.getElementById('target');

        $('#geocoded_container').removeClass('hidden').hide();

        addressComplete();
    });
}))