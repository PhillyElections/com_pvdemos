jQuery.noConflict();
(function(scoped) {
    scoped(window.jQuery, window.L, window, document)
}(function(JQ, L, W, D) {
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
        CN(arguments)
        if (!searchBox) return false;
        JQ(searchBox).autocomplete({
            minLength: 3,
            source: function(request, callback) {
                var service = Services.address_completer,
                    space = request.term.indexOf(' ')
                // let's not run until we've entered a street number
                // and the first letter of the street
                if (space > 0 && space < request.term.length - 1) {
                    JQ.getJSON(service.url(request.term), service.params, function(response) {
                        if (response.status == "success") {
                            var addresses = JQ.map(response.data, function(candidate) {
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
        CN(arguments)
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
        CN(arguments)
        if (!searchBox || !searchBox.value) {
            return false;
        }
        var enteredAddress,
            zipCode,
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
        if (message == 1) {
            getHome = getPhilaAddressData(enteredAddress)
        } else {
            getHome = getPhilaAddressData(LastAddressComplete.label + ', ' + LastAddressComplete.zip);
        }
        getHome.done(function(data) {
            var i = 0,
                customAddressTables = '<table width=" 100%" cellspacing="0" cellpadding="3" id="multiple_address_tbl">',
                customAddressTablesFullMarks = '<table width=" 100%" cellspacing="0" cellpadding="3" id="multiple_address_tbl">';
            JQ.each(data.features, function(idx, feature) {
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
                        //zipCode = feature.properties.zip_code
                        GrouperContext = ['home', 'pollingplace', wardDivision.toString()]
                console.log(feature)
                        AddressData.home = makeAddressDataElement(feature, service, enteredAddress)
                        Markers.home = L.marker(AddressData.home.coordinates, {
                            icon: Icons.home,
                        });
                        writeGeocoding();
                        GrouperContext = 'one.up'
                        setTimeout(function () {grouper("<p style=\"border: 1px black\"><b>" + enteredAddress + "</b><br>Zip: <b>" + feature.properties.zip_code + "</b><br>Precinct: <b>" + wardDivision + "</b></p>")}, 500);
                    }
                }
                if (!wardDivision || data.features.length === 0) {
                    invalidAddress();
                }
            }
        }).fail(invalidAddress);
    }

    function popupFunctionAddress(data, service, icon, enteredAddress, content) {
        CN(arguments)
        JQ('#multiple_address_tbl').html(content);
        JQ('#cstm-score-address-popup').dialog({
            modal: true,
            buttons: {
                Ok: function() {
                    if (JQ('[name="address_vals"]').is(':checked')) {
                        var checkedInputVal = JQ('input:radio[name=address_vals]:checked').val();
                        JQ('#cstm-score-address-popup').dialog('close');
                        if (checkedInputVal == '-1') {
                            JQ('#target').val('');
                        } else {
                            JQ.each(data.features, function(idx, feature) {
                                if (checkedInputVal == feature.properties.street_address) {
                                    wardDivision = feature.properties.election_precinct || feature.properties.political_division;
                                    //zipCode = feature.properties.zip_code
                                    GrouperContext = ['home', 'pollingplace', wardDivision.toString()]

                                    AddressData.home = makeAddressDataElement(feature, service, checkedInputVal)
                                    Markers.home = L.marker(AddressData.home.coordinates, {
                                        icon: Icons.home,
                                    });
                                    writeGeocoding();
                                    GrouperContext = 'one.up'
                                    setTimeout(function () {grouper("<p style=\"border: 1px black\"><b>" + enteredAddress + "</b><br>Zip: <b>" + feature.properties.zip_code + "</b><br>Precinct: <b>" + wardDivision + "</b></p>")}, 500);
                                }
                            });
                            if (!wardDivision || data.features.length === 0) {
                                invalidAddress();
                            } else {
                                addressNotEntered();
                            }
                        }
                    } else {
                        var tips = JQ('.validateTips');
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
      JQ('#geocodeme_container').fadeOut(100);
      JQ('#geocoded_container').fadeIn(250);
      JQ("#zip").val(AddressData.home.data.zip_code);
      JQ("#lat").val(AddressData.home.coordinates[0]);
      JQ("#lng").val(AddressData.home.coordinates[1]);
      JQ("#precinct").val(AddressData.home.data.election_precinct);
      JQ("#display-building").text(AddressData.home.coordinates[0] + ", " + AddressData.home.coordinates[1])
      JQ("#display-precinct").text(AddressData.home.data.election_precinct)
    }

    function getPhilaAddressData(input) {
        CN(arguments)
        var deferred = JQ.Deferred(),
            service = Services.geocoder,
            addresses = []
        JQ.getJSON(service.url(input), service.params).done(function(response) {
            deferred.resolve(response)
        }).fail(function(response) {
            deferred.reject(response);
        });

        return deferred.promise()
    }

    function makeAddressDataElement(feature, service, input) {
        CN(arguments)
        return {
            coordinates: [feature.geometry.coordinates[1], feature.geometry.coordinates[0]],
            style: service.style,
            data: feature.properties,
            name: input
        }
    }

    function getShapeFromService(input, service) {
        CN(arguments)
        var deferred = JQ.Deferred()
        JQ.getJSON(service.url(input), service.params).done(function(response) {
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
        CN(arguments)
        var deferred = JQ.Deferred(),
            service = Services.indexer;
        JQ.getJSON(service.url(input), service.params).done(function(data) {
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
        CN(arguments)
        Lmap.eachLayer(function(layer) {
            Lmap.removeLayer(layer);
        });
    }

    function setDefaultBasemaps() {
        CN(arguments)
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
        CN(arguments)
        removeBasemaps()
        if (BASEMAP2) {
            L.esri.tiledMapLayer({
                url: BASEMAP2
            }).addTo(Lmap)
        }
    }

    function clearShapes() {
        CN(arguments)
        for (var prop in Shapes) {
            if (!Shapes.hasOwnProperty(prop)) continue;
            Lmap.removeLayer(Shapes[prop]);
            Shapes[prop].up = false
        }
    }

    function clearMarkers(justOne) {
        CN(arguments)
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
        CN(arguments)
        Shapes[shape.geoJSON.properties.name] = L.geoJSON(shape.geoJSON, shape.style);
        Shapes[shape.geoJSON.properties.name]['up'] = true;
    }

    function drawShapes(shapesToDraw) {
        CN(arguments)
        for (var prop in shapesToDraw) {
            if (!shapesToDraw.hasOwnProperty(prop)) continue;
            drawShape(shapesToDraw[prop], prop);
        }
        setTimeout(grouper, 1000);
    }
    // end map functions

    function addDistrictToList(element, content, value, set) {
        CN(arguments)
        element.append(JQ('<option />').text(content).val(value).prop('disabled', !!set));
    }

    function tabFunc() {
        CN(arguments)
        return tabFunctions[getActive()]();
    }

    function getActive() {
        CN(arguments)
        return JQ('#nav').find('li.active').attr('id')
    }

    // my utils
    // specify markers or set Markers
    function grouper(tooltip) {
        CN(arguments)
        var features = [],
            props = [];

        for (var prop in Markers) {
            if (!Markers.hasOwnProperty(prop)) continue;
            var feature = Markers[prop];
            if ((GrouperContext == 'all.up' && feature.up) || GrouperContext.indexOf(prop) > -1 || GrouperContext == 'one.up') {
                feature.up = true;
                feature.addTo(Lmap);
                console.log(feature)
                if (tooltip) {
                  feature.bindTooltip(tooltip).openTooltip();                  
                }
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
        CN(arguments)
        wardDivision = '';
        //if (!searchBox || !searchBox.value) return
        alert('The address you have chosen is invalid. Please select an address in Philadelphia.');
    }

    function clearCustomMap() {
        CN(arguments)
        JQ('.custom-map-selector').val([]).change();
    }

    function showBallotDropdown() {
        CN(arguments)
        var b = JQ('#ballots_dropdown').val();
        if (b != '') {
            var a = baseUri + 'ballot_paper/' + b + '.pdf';
            var c = W.open(a, '_blank');
            c.focus();
        } else {
            alert();
        }
    }

    // utils
    JQ.support.cors = true;

    String.prototype.toProperCase = function() {
        return this.replace(/\w\S*/g, function(a) {
            return a.charAt(0).toUpperCase() + a.substr(1).toLowerCase();
        });
    };

    function getHash() {
        CN(arguments)
        return W.location.hash.substring(1);
    }

    function isEqual(value, other) {
        CN(arguments)

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
        CN(arguments)
        return [coords[1], coords[0]]
    }

    function coordsSwapAll(coords) {
        CN(arguments)
        var tmp = []
        for (var i = 0; i < coords.length - 1; i++) {
            tmp.push([coords[i][1], coords[i][0]])
        }
        return tmp
    }

    function pad(n, width, z) {
        CN(arguments)
        n = n + '' // cast to string
        z = z || '0' // default padding: '0'
        width = width || 2 // default digits: 2
        return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n
    }

    function s4() {
        CN(arguments)
        return Math.floor((1 + Math.random()) * 65536).toString(16).substring(1);
    }

    function guid() {
        CN(arguments)
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }

    function getQueryParams(qs) {
        CN(arguments)
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
        CN(arguments)
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

    function CN(args) {

        if (0) {
            return '';
        }
        var re = /function (.*?)\(/;
        var s = CN.caller.toString();
        var m = re.exec(s);
        console.log(m[1], args.length ? args : "");
    }

    // events

    if (D.addEventListener) {
        W.addEventListener('hashchange', onhashChange, false);
    } else if (D.attachEvent) {
        W.attachEvent('onhashchange', onhashChange);
    }

    // explicit typed search
    JQ(D).on('keydown', '#target', function(event) {
        if (event.key === 'Enter' && searchBox.value) {
            LastAddressComplete = [];
            addressEntered(1)
        }
    });

    // explicit clicked search
    JQ(D).on('click', '#geocodeme', function(event) {
        searchBox.value = JQ('#address_street').val();
        LastAddressComplete = [];
        addressEntered(1)
    });

    // overcome chrome autocomplete
    JQ(D).on('mouseup keyup','#target', function () {
        var val = JQ('#target').val();
        val = val.length;
        if (val === 0) {
            JQ('#target').attr('autocomplete', 'on');
        }
        else {
            JQ('#target').attr('autocomplete', 'new-password');
        }
    }).on('mousedown keydown','#target', function () {
        var val = JQ('#target').val();
        var length = val.length;
        if (!length) {
            JQ('#target').attr('autocomplete', 'new-password');
        }
    });

    // init
    JQ(function() {
        // ui setup actions
        JQ('.office-level-accordion > dd').hide();
        JQ('.office-accordion > dd').hide();

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

        var JQgc = JQ('#geocoded_container');
        if (JQgc.length) {
          JQgc.removeClass('hidden').hide();
        } else {
          wardDivision = JQ("#precinct").val();
          GrouperContext = ['home', 'pollingplace', wardDivision.toString()]
          var feature = []
          feature.properties = []
          feature.geometry = []
          feature.properties.election_precinct = wardDivision
          feature.geometry.coordinates = [JQ('#lng').val(), JQ('#lat').val()]
          AddressData.home = makeAddressDataElement(feature, Services.geocoder, JQ("#address_street").val())
          Markers.home = L.marker(AddressData.home.coordinates, {
            icon: Icons.home,
          })
          writeGeocoding()
          GrouperContext = 'one.up';
          setTimeout(grouper, 500);
        }
        addressComplete()
    });
}))