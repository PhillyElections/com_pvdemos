jQuery.noConflict();
(function(scoped) {
    scoped(window.jQuery, window.L, window, document)
}(function(JQ, L, W, D) {
    //'use strict'

    var ie = /msie ([0-9]+)\.[0-9]+/.exec(navigator.userAgent.toLowerCase()),
        GATEKEEPER_KEY = 'f2e3e82987f8a1ef78ca9d9d3cfc7f1d',
        CITY_HALL = [39.95262, -75.16365],
        ZOOM = 13,
        BASEMAP1 = '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap/MapServer',
        BASEMAP1_LABELS = '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap_Labels/MapServer',
        BASEMAP2 = '//services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer',
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
        Icons = {
            home: L.icon({
                iconUrl: 'components/com_voterapp/assets/images/home.png',
                iconSize: [32, 37],
                iconAnchor: [16, 37]
            }),
            polling: L.icon({
                iconUrl: 'components/com_voterapp/assets/images/polling.png',
                iconSize: [32, 37],
                iconAnchor: [16, 37]
            }),
            congress: L.icon({
                iconUrl: 'components/com_voterapp/assets/images/congress.png',
                iconSize: [32, 37],
                iconAnchor: [16, 37]
            }),
            entrance: L.icon({
                iconUrl: 'components/com_voterapp/assets/images/e.png',
                iconSize: [24, 24],
            }),
            handi: L.icon({
                iconUrl: 'components/com_voterapp/assets/images/h.png',
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
            }
        };


    // begin ajax functions
    function addressComplete() {
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
        if (!searchBox || !searchBox.value) {
            return false;
        }

        if (!wardDivision) {
            invalidAddress();
            return false;
        }

        if (!AllIndexes.length) {
            setIndexes();
        } else {
//            tabFunc();
        }
    }

    function getPhilaAddressData(input) {
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
        return {
            coordinates: [feature.geometry.coordinates[1], feature.geometry.coordinates[0]],
            style: service.style,
            data: feature.properties,
            name: input
        }
    }

    // end ajax functions

    // map functions
    function removeBasemaps() {
        Lmap.eachLayer(function(layer) {
            Lmap.removeLayer(layer);
        });
    }
    function setDefaultBasemaps() {
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
        removeBasemaps()
        if (BASEMAP2) {
            L.esri.tiledMapLayer({
                url: BASEMAP2
            }).addTo(Lmap)
        }
    }

    function clearShapes() {
        for (var prop in Shapes) {
            if (!Shapes.hasOwnProperty(prop)) continue;
            Lmap.removeLayer(Shapes[prop]);
            Shapes[prop].up = false
        }
    }

    function clearMarkers(justOne) {
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
        Shapes[shape.geoJSON.properties.name] = L.geoJSON(shape.geoJSON, shape.style);
        Shapes[shape.geoJSON.properties.name]['up'] = true;
    }

    function drawShapes(shapesToDraw) {
        for (var prop in shapesToDraw) {
            if (!shapesToDraw.hasOwnProperty(prop)) continue;
            drawShape(shapesToDraw[prop], prop);
        }
        setTimeout(grouper, 1000);
    }
    // end map functions

     function addDistrictToList(element, content, value, set) {
        element.append(JQ('<option />').text(content).val(value).prop('disabled', !!set));
    }

    function getActive() {
        return JQ('#nav').find('li.active').attr('id')
    }

    // my utils
    // specify markers or set Markers
    function grouper() {
        var features = [],
            props = [];

        for (var prop in Markers) {
            if (!Markers.hasOwnProperty(prop)) continue;
            var feature = Markers[prop];
            if ((GrouperContext == 'all.up' && feature.up) || GrouperContext.indexOf(prop) > -1) {
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
        } else if (isEqual(props, GrouperContext)) {
            FeatureGroup = new L.featureGroup(features);
            Lmap.fitBounds(FeatureGroup.getBounds());
        } else {
            // not all, not specifically in GrouperContext
        }
    }

    function invalidAddress() {
        wardDivision = '';
        //if (!searchBox || !searchBox.value) return
        alert('The address you have chosen is invalid. Please select an address in Philadelphia.');
    }

    function getSampleBallot() {
        var ward = AllIndexes.ward,
            division = AllIndexes.division,
            sample_div = ward + "-" + division,
            el_parent = JQ("#download-ballot-intro");

        if (typeof ward_divisions_files === 'undefined' || !ward_divisions_files) {

            var inner_html = '<h3>' + Joomla.JText._('DOWNLOAD BALLOT INTRO HEADER NO BALLOT') + '</h3><br/><p>' + Joomla.JText._('DOWNLOAD BALLOT INTRO TEXT NO BALLOT') + '</p>';
            JQ(el_parent).html(inner_html);
            JQ("#sample-pdf").html("");
            return;
        }
        if (typeof ward_divisions_files[sample_div] !== 'undefined') {
            if (typeof ward_divisions_files[sample_div].file_id !== 'undefined') {
                if (ward_divisions_files[sample_div].file_id != '') {

                    var pdf_url = baseUri + 'ballot_paper/' + ward_divisions_files[sample_div].file_id + '.pdf';

                    var html = '<object width="100%" height="100%" data="' + pdf_url + '?#zoom=0&amp;scrollbar=1&amp;toolbar=0&amp;navpanes=0" type="application/pdf">NO PDF FOUND</object>';

                    JQ("#sample-pdf").html(html);
                    var inner_html = '<h3>' + Joomla.JText._('DOWNLOAD BALLOT INTRO HEADER AFTER') + '</h3><br/><p>' + Joomla.JText._('DOWNLOAD BALLOT INTRO TEXT AFTER') + '</p><br/><a href="' + baseUri + 'ballot_paper/' + ward_divisions_files[sample_div].file_id + '.pdf" target="_blank" class="showPDF">' + Joomla.JText._('DOWNLOAD BALLOT BUTTON TEXT') + '</a>';
                    JQ(el_parent).html(inner_html);
                    /* Looping for other ballot */
                    var unique = [];
                    var unique_wards = [];
                    JQ.each(ward_divisions_files, function(i, val) {

                        if ((unique.indexOf(val.sid) === -1)) {
                            unique.push(val.sid);
                            unique_wards.push(i);
                        }
                    });
                    //Generate other downloads here
                    var other_htm = '';
                    if (unique.length > 1) {
                        other_htm += '<select id="ballots_dropdown" name="ballots_dropdown" ><option value="">' + Joomla.JText._('DOWNLOAD BALLOT EMPTY DROPDOWN TEXT') + '</option>';
                        var display = {},
                            sortMe = [];

                        for (var i = 0; i < unique_wards.length; i++) {
                            if (ward_divisions_files[unique_wards[i]].file_id != ward_divisions_files[sample_div].file_id) {
                                sortMe.push(ward_divisions_files[unique_wards[i]].sid);
                                display[ward_divisions_files[unique_wards[i]].sid] = ward_divisions_files[unique_wards[i]].file_id;
                            }
                        }

                        sortMe.sort().forEach(function(i) {
                            other_htm += '<option value="' + display[i] + '">Spilt ' + i + '</option>';
                        });

                        other_htm += '</select>&nbsp;&nbsp;<button value="Show Me" name="Show Me" id="show-ballot-dropdown">' + Joomla.JText._('SHOW ME TEXT') + '</button>';
                    }
                    var htm = '<h3>' + Joomla.JText._('OTHER SAMPLE BALLOTS HEADER') + '</h3><br/><p>' + Joomla.JText._('OTHER SAMPLE BALLOTS TEXT') + '</p><br/>' + other_htm;
                    JQ("#download-ballot-info").html(htm);
                    JQ("#download-ballot-info").show();
                    return;
                }
            }
        }

        var inner_html = '<h3>' + Joomla.JText._('DOWNLOAD BALLOT INTRO HEADER NO BALLOT') + '</h3><br/><p>' + Joomla.JText._('DOWNLOAD BALLOT INTRO TEXT NO BALLOT') + '</p>';
        JQ(el_parent).html(inner_html);
        JQ("#sample-pdf").html("");
    }

    function showBallotDropdown() {
        var b = JQ('#ballots_dropdown').val();
        if (b != '') {
            var a = baseUri + 'ballot_paper/' + b + '.pdf';
            var c = W.open(a, '_blank');
            c.focus();
        } else {
            alert();
        }
    }

    function tabsReset() {
        clearShapes();
        clearMarkers();
        JQ('#nav-elected-officials').removeClass('active');
        JQ('#nav-polling-place').removeClass('active');
        JQ('#nav-my-maps').removeClass('active');
        JQ('#nav-maps').removeClass('active');
        JQ('#nav-download-ballot').removeClass('active');
        JQ('#polling-place').hide();
        JQ('#elected-officials').hide();
        JQ('#my-maps').hide();
        JQ('#maps').hide();
        JQ('#download-ballot').hide();
    }

    function showTabElectedOfficials() {
        tabsReset();
        JQ('#nav-elected-officials').addClass('active');
        JQ('#elected-officials').show();
        addressNotEntered();
    }

    function showTabPollingplace() {
        tabsReset();
        JQ('#nav-polling-place').addClass('active');
        JQ('#polling-place').show();
        addressNotEntered();
    }

    function showTabMyMaps() {
        tabsReset();
        JQ('#nav-my-maps').addClass('active');
        JQ('#my-maps').show();
        populateMySelect2Lists('#my-maps-selector', VoterShapes, 'district-type', '');
        addressNotEntered();
    }

    function resetAllSelect2() {
        JQ('#my-maps-selector').empty();
        JQ('#custom-divisions').empty();
        JQ('#custom-wards').empty();
        JQ('#custom-council-districts').empty();
        JQ('#custom-parep-districts').empty();
        JQ('#custom-pasen-districts').empty();
        JQ('#custom-uscongress-districts').empty();
    }

    function showTabMaps() {
        tabsReset();
        var service = Services.indexer_list;
        JQ('#nav-maps').addClass('active');
        JQ('#maps').show();
        populateSelect2Lists('#custom-divisions', divisions, 'division_id', service.url('division'));
        populateSelect2Lists('#custom-wards', wards, 'ward', service.url('ward'));
        populateSelect2Lists('#custom-council-districts', councilDistricts, 'council_district', service.url('council'));
        populateSelect2Lists('#custom-parep-districts', stateRepDistricts, 'state_representative_district', service.url('parep'));
        populateSelect2Lists('#custom-pasen-districts', stateSenateDistricts, 'state_senate_district', service.url('pasenate'));
        populateSelect2Lists('#custom-uscongress-districts', usCongressDistricts, 'congressional_district', service.url('uscongress'));
        addressNotEntered();
    }

    function showTabBallot() {
        tabsReset();
        JQ('#nav-download-ballot').addClass('active');
        JQ('#download-ballot').show();
        addressNotEntered();
    }

    function populateSelect2Lists(elemId, data, index, url) {
        var JQelem = JQ(elemId);
        JQelem.empty()
        if (data) {
            if ('#custom-divisions' !== elemId) {
                JQelem.append(JQ('<option>').text('ALL'));
            }
            data.forEach(function(datum) {
                JQelem.append(JQ('<option>').text(datum[index]));
            });
            JQelem.prop('disabled', false);
        } else {
            JQ.getJSON(url).done(function(datum) {
                data = datum;
                populateSelect2Lists(elemId, data, index, url);
            });
        }
        JQelem.prop('disabled', false);
    }

    function populateMySelect2Lists(elemId, data, index, url) {
        var JQelem = JQ(elemId);
        JQelem.empty();
        for (var prop in data) {
            if (!data.hasOwnProperty(prop)) continue;
            JQelem.append(JQ('<option>').text(prop));
        }
        JQelem.prop('disabled', false);
    }

    // utils
    JQ.support.cors = true;

    String.prototype.toProperCase = function() {
        return this.replace(/\w\S*/g, function(a) {
            return a.charAt(0).toUpperCase() + a.substr(1).toLowerCase();
        });
    };

    function getHash() {
        return W.location.hash.substring(1);
    }

    function isEqual(value, other) {

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
        return [coords[1], coords[0]]
    }

    function coordsSwapAll(coords) {
        var tmp = []
        for (var i = 0; i < coords.length - 1; i++) {
            tmp.push([coords[i][1], coords[i][0]])
        }
        return tmp
    }

    function pad(n, width, z) {
        n = n + '' // cast to string
        z = z || '0' // default padding: '0'
        width = width || 2 // default digits: 2
        return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n
    }

    function s4() {
        return Math.floor((1 + Math.random()) * 65536).toString(16).substring(1);
    }

    function guid() {
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }

    function getQueryParams(qs) {
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

    JQ(D).on('click', '#show-ballot-dropdown', function() {
        showBallotDropdown();
    });
    JQ(D).on('click', '#polling-place-directions-header', function(e) {
        var saddr = (AddressData.home.data.street_address + ' Philadelphia PA ' + AddressData.home.data.zip_code).replace(" ", "+"),
            daddr = (AddressData.pollingplace_table.pin_address + ' Philadelphia PA ' + AddressData.pollingplace_table.zip_code).replace(" ", "+")
        window.open('https://maps.google.com?saddr=' + saddr + '&daddr=' + daddr, "driving-directions")
        e.preventDefault();
        return false;
    });
    JQ(D).on('keydown', '#street_address', function(event) {
        if (event.key === 'Enter' && searchBox.value) {
            LastAddressComplete = [];
            addressEntered(1)
        }
    });
    // overcome chrome autocomplete
    JQ(D).on('mouseup keyup','#street_address', function () {
        var val = JQ('#street_address').val();
        val = val.length;
        if (val === 0) {
            JQ('#street_address').attr('autocomplete', 'on');
        }
        else {
            JQ('#street_address').attr('autocomplete', 'new-password');
        }
    }).on('mousedown keydown','#street_address', function () {
        var val = JQ('#street_address').val();
        var length = val.length;
        if (!length) {
            JQ('#street_address').attr('autocomplete', 'new-password');
        }
    });

    // init
    JQ(function() {
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

        addressComplete();
        var params = getQueryParams(D.location.search);
        if (typeof params.address !== 'undefined') {
            searchBox.value = params.address;

            setTimeout(function() {
                LastAddressComplete = [];
                addressEntered(1)

            }, 650)
        }
    });
}))