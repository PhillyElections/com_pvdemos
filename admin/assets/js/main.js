jQuery.noConflict();
(function(scoped) {
    scoped(window.jQuery, window.L, window, document)
}(function($, L, W, D) {
    //'use strict'

    var ie = /msie ([0-9]+)\.[0-9]+/.exec(navigator.userAgent.toLowerCase()),
        GATEKEEPER_KEY = 'f2e3e82987f8a1ef78ca9d9d3cfc7f1d',
        CITY_HALL = [39.95262, -75.16365],
        ZOOM = 13,
        BASEMAP1 = '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap/MapServer',
        BASEMAP1_LABELS = '//tiles.arcgis.com/tiles/fLeGjb7u4uXqeF9q/arcgis/rest/services/CityBasemap_Labels/MapServer',
        BASEMAP2 = '//services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer',
        baseUri = https://
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
        tabFunctions = {
            'nav-polling-place': function() {
                if (wardDivision) {
                    GrouperContext = ['home', 'pollingplace', wardDivision.toString()];
                }
                $('#map-canvas').show();
                $('#sample-pdf').hide();
//                setTimeout(
//                    getPollingPlace, 200);
                getPollingPlace()
            },
            'nav-elected-officials': function() {
                GrouperContext = ['office'];
                $('#map-canvas').show();
                $('#sample-pdf').hide();
                getOfficials();
                if (mayorAddress) {
                    dropOfficePin(mayorAddress);
                }
            },
            'nav-my-maps': function() {
                $('#map-canvas').show();
                $('#sample-pdf').hide();
                if (VoterShapes) {
                    updateMyMap()
                }
            },
            'nav-maps': function() {
                $('#map-canvas').show();
                $('#sample-pdf').hide();
                if (CustomShapes) {
                    updateCustomMap()
                }
            },
            'nav-download-ballot': function() {
                GrouperContext = '';
                getSampleBallot();
                $('#map-canvas').hide();
                $('#sample-pdf').show();
            }
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
                showInfos();
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
            tabFunc();
        }
    }

    function addressEntered(message) {
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
        resetAllSelect2();
        AddressData.home = null;
        clearCustomMap();
        service = Services.geocoder;

        if (!searchBox.value) {
            invalidAddress();
            return;
        }
        enteredAddress = searchBox.value;
        icon = baseUri + 'components/com_voterapp/assets/images/home.png';
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
            customAddressTables += '<tr><td><input type="radio" name="address_vals" value="-1">' + Joomla.JText._('MODALBOX LAST OPTION') + '</td></tr>';
            customAddressTables += '</table>';
            customAddressTablesFullMarks += '<tr><td><input type="radio" name="address_vals" value="-1">' + Joomla.JText._('MODALBOX LAST OPTION') + '</td></tr>';
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
                        setIndexes();
                        AddressData.home = makeAddressDataElement(feature, service, enteredAddress)
                        Markers.home = L.marker(AddressData.home.coordinates, {
                            icon: Icons.home,
                        });
                    }
                }
                if (!wardDivision || data.features.length === 0) {
                    invalidAddress();
                }
            }
        }).fail(invalidAddress);
    }

    function popupFunctionAddress(data, service, icon, enteredAddress, content) {
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

    function getPollingPlace() {

        if (!AddressData.pollingplace_table) {
            $.ajax({
                type: 'GET',
                url: Services.polling_place.url(AllIndexes.precinct),
//                url: baseUri + 'index.php',
/*                data: {
                    option: 'com_pollingplaces',
                    view: 'json',
                    ward: AllIndexes.ward,
                    division: AllIndexes.division
                },*/
                dataType: 'json',
                //            async: false,
                success: writePollingPlace,
                error: function(request, status, error) {
                    alert(status + ' ' + error);
                }
            });
        } else {
            writePollingPlace();
        }
    }

    function writePollingPlace(data) {
        var coordinates = {},
            datum,
            content,
            buildingCode,
            parkingCode,
            $pollingPlaceMain = $('#polling-place-main');
        buildingCode = parkingCode = content = null;
        if (data) {
            datum = data.features.attributes[0];
            coordinates.main = [datum.lat, datum.lng];
            coordinates.entrance = [datum.elat, datum.elng];
            coordinates.handicap = [datum.alat, datum.alng];
            AddressData.pollingplace_table = datum;
            AddressData.pollingplace_table.coordinates = coordinates;
        } else {
            datum = AddressData.pollingplace_table;
        }

        if ($('#nav-polling-place').hasClass('active')) {
            dropPollingPin();
        }

        buildingCode = buildingCodes[datum.building];
        parkingCode = parkingCodes[datum.parking];

        content = '<div id="polling-place-info"><h3 class="polling-place-info-header">' +
            Joomla.JText._('YOUR POLLING PLACE') +
            '</h3><div id="polling-place-info-container"><br><div id="polling-info-card"><strong>' +
            Joomla.JText._('WARD') + ' ' + datum.ward + ' ' +
            Joomla.JText._('DIVISION') + ' ' + datum.division + '</strong><br><hr><strong>' +
            Joomla.JText._('P_LOCATION') + ' </strong><br/>' + datum.location.toProperCase() + '<br/><br/><strong>' +
            Joomla.JText._('P_ADDRESS') + ' </strong><br/>' + datum.display_address + '<br/>Philadelphia, PA ' +
            datum.zip_code + '<br/><br/><strong>' + Joomla.JText._('P_ACCESSIBILITY') +
            '</strong><br/><span id="polling-building">' + buildingCode + '</span><br/><br/><strong>' +
            Joomla.JText._('P_PARKING') + '</strong><br/><span id="polling-parking">' + parkingCode +
            '</span><br/></div><br /></div><button class="btn" id="polling-place-directions-header">' +
            Joomla.JText._('DIRECTIONS') + '</button>';

        $pollingPlaceMain.empty();
        $pollingPlaceMain.html(content);
        $('#polling-place-info').accordion({
            header: 'h3',
            collapsible: true
        });
    }

    function dropPollingPin() {
        Markers.pollingplace = L.marker(AddressData.pollingplace_table.coordinates.main, {
            icon: Icons.polling,
        });
        if (getActive() == 'nav-polling-place' && "undefined" == typeof Shapes['home-division']) {
            setTimeout(grouper, 1000);
            return
        }
        setTimeout(grouper, 1000);
    }

    function getOfficials() {
        // federal_house
        var federal_house = AllIndexes.federal_house_old || AllIndexes.federal_house,
            state_senate = AllIndexes.state_senate,
            state_house = AllIndexes.state_house,
            city_council = AllIndexes.city_district,
            ward = AllIndexes.ward,
            division = AllIndexes.division;
        $.ajax({
            type: 'GET',
            url: baseUri + 'index.php',
            data: {
                option: 'com_electedofficials',
                view: 'json',
                congressional_district: federal_house,
                state_senate_district: state_senate,
                state_representative_district: state_house,
                council_district: city_council
            },
            dataType: 'json',
            async: false,
            success: writeOfficials,
            error: function(request, status, error) {
                alert(status + ' ' + error);
            }
        });
    }

    function writeOfficials(data) {
        $('.office-accordion').find('dd').html('');
        $.each(data.officials, function(idx, datum) {
            var guId = guid(),
                officer = '',
                officeLevel = datum.office_level,
                leadershipRole = datum.leadership_role,
                office = datum.office,
                federal_house = datum.congressional_district,
                state_senate = datum.state_senate_district,
                state_house = datum.state_representative_district,
                city_council = datum.council_district,
                pinStyle = 'class="drop-office-pin"',
                addressOne = datum.main_contact_address_1 + ',' + datum.main_contact_city + ',' + datum.main_contact_state + ' ' + datum.main_contact_zip,
                addressTwo = datum.local_contact_1_address_1 + ',' + datum.local_contact_1_city + ',' + datum.local_contact_1_state + ' ' + datum.local_contact_1_zip,
                addressThree = datum.local_contact_2_address_1 + ',' + datum.local_contact_2_city + ',' + datum.local_contact_2_state + ' ' + datum.local_contact_2_zip,
                addressFour = datum.local_contact_3_address_1 + ',' + datum.local_contact_3_city + ',' + datum.local_contact_3_state + ' ' + datum.local_contact_3_zip,
                information = '';
            if (datum.first_name) {
                officer = datum.first_name;
            }
            if (datum.middle_name) {
                officer = officer + ' ' + datum.middle_name;
            }
            if (datum.last_name) {
                officer = officer + ' ' + datum.last_name;
            }
            if (datum.suffix) {
                officer = officer + ' ' + datum.suffix;
            }
            // <div id="more-' + guId + '" class="more-info-div"><a href="javascript:void(0)" id="hide-more-link-' + guId + '" onClick="hideMoreInfo(\'' + guId + '\')" class="hide-more-link"><a class="icon-angle-left icon-3x"></a></a><strong style="font-size:11px;">' + officer + "</strong> (' + party + ')<br>' + office + ' ' + leadershipRole + '<br>';
            information = '<div data-value="' + guId + '" class="more-info-div"><span data-value="' + guId + '" class="hide-more-link">&laquo;</span><strong style="font-size:11px;">' + officer + '</strong> (' + datum.party + ')<br>' + office + ' ' + leadershipRole + '<br>';
            if (datum.email) {
                information += '<br><a href="mailto:' + datum.email + '" target="_top">' + Joomla.JText._('EMAIL') + ' <a class="icon-envelope-alt"></a></a>';
            }
            if (datum.website) {
                information += '<br><a href="https://' + datum.website + '" target="_blank">' + Joomla.JText._('WEBSITE') + ' <a class="icon-external-link"></a></a>';
            }
            if (datum.main_contact_address_1 || datum.main_contact_address_2 || datum.main_contact_phone || datum.main_contact_fax || datum.main_contact_city || datum.main_contact_state || datum.main_contact_zip) {
                information += '<hr><h4><span data-value="' + addressOne + '" ' + (datum.main_contact_address_1 && datum.main_contact_city == 'Philadelphia' ? pinStyle : '') + '>' + Joomla.JText._('MAIN OFFICE') + ' <a class="icon-map-marker icon-large"></a></a></h4><br>';
            }
            if (datum.main_contact_phone) {
                information += '<strong>' + Joomla.JText._('PHONE') + '</strong> <span class="phone">' + datum.main_contact_phone + '</span><br>';
            }
            if (datum.main_contact_fax) {
                information += '<strong>' + Joomla.JText._('FAX') + '</strong> <span class="phone">' + datum.main_contact_fax + '</span><br>';
            }
            if (datum.main_contact_address_1 || datum.main_contact_address_2 || datum.main_contact_city || datum.main_contact_state || datum.main_contact_zip) {
                information += '<br><strong>' + Joomla.JText._('OFFICE_ADDRESS') + '</strong><br>';
            }
            if (datum.main_contact_address_1) {
                information += datum.main_contact_address_1 + '<br>';
            }
            if (datum.main_contact_address_2) {
                information += datum.main_contact_address_2 + '<br>';
            }
            if (datum.main_contact_city) {
                information += datum.main_contact_city + ', ' + datum.main_contact_state + ' ' + datum.main_contact_zip + '<br>';
            }
            if (datum.local_contact_1_address_1 || datum.local_contact_1_address_2 || datum.local_contact_1_phone || datum.local_contact_1_fax || datum.local_contact_1_city || datum.local_contact_1_state || datum.local_contact_1_zip) {
                information += '<hr><h4><span data-value="' + addressTwo + '" ' + (datum.local_contact_1_address_1 && datum.local_contact_1_city == 'Philadelphia' ? pinStyle : '') + '>' + Joomla.JText._('LOCAL OFFICE') + ' <a class="icon-map-marker icon-large"></a></a></h4><br>';
            }
            if (datum.local_contact_1_phone) {
                information += '<strong>' + Joomla.JText._('PHONE') + '</strong> <span class="phone">' + datum.local_contact_1_phone + '</span><br>';
            }
            if (datum.local_contact_1_fax) {
                information += '<strong>' + Joomla.JText._('FAX') + '</strong> <span class="phone">' + datum.local_contact_1_fax + '</span><br>';
            }
            if (datum.local_contact_1_address_1 || datum.local_contact_1_address_2 || datum.local_contact_1_city || datum.local_contact_1_state || datum.local_contact_1_zip) {
                information += '<br><strong>' + Joomla.JText._('OFFICE_ADDRESS') + '</strong><br>';
            }
            if (datum.local_contact_1_address_1) {
                information += datum.local_contact_1_address_1 + '<br>';
            }
            if (datum.local_contact_1_address_2) {
                information += datum.local_contact_1_address_2 + '<br>';
            }
            if (datum.local_contact_1_city) {
                information += datum.local_contact_1_city + ', ' + datum.local_contact_1_state + ' ' + datum.local_contact_1_zip + '<br>';
            }
            if (datum.local_contact_2_address_1 || datum.local_contact_2_address_2 || datum.local_contact_2_phone || datum.local_contact_2_fax || datum.local_contact_2_city || datum.local_contact_2_state || datum.local_contact_2_zip) {
                information += '<hr><h4><span data-value="' + addressThree + '" ' + (datum.local_contact_2_address_1 && datum.local_contact_2_city == 'Philadelphia' ? pinStyle : '') + '>' + Joomla.JText._('LOCAL OFFICE') + ' <a class="icon-map-marker icon-large"></a></a></h4><br>';
            }
            if (datum.local_contact_2_phone) {
                information += '<strong>' + Joomla.JText._('PHONE') + '</strong> <span class="phone">' + datum.local_contact_2_phone + '</span><br>';
            }
            if (datum.local_contact_2_fax) {
                information += '<strong>' + Joomla.JText._('FAX') + '</strong> <span class="phone">' + datum.local_contact_2_fax + '</span><br>';
            }
            if (datum.local_contact_2_address_1 || datum.local_contact_2_address_2 || datum.local_contact_2_city || datum.local_contact_2_state || datum.local_contact_2_zip) {
                information += '<br><strong>' + Joomla.JText._('OFFICE_ADDRESS') + '</strong><br>';
            }
            if (datum.local_contact_2_address_1) {
                information += datum.local_contact_2_address_1 + '<br>';
            }
            if (datum.local_contact_2_address_2) {
                information += datum.local_contact_2_address_2 + '<br>';
            }
            if (datum.local_contact_2_city) {
                information += datum.local_contact_2_city + ', ' + datum.local_contact_2_state + ' ' + datum.local_contact_2_zip + '<br>';
            }
            if (datum.local_contact_3_address_1 || datum.local_contact_3_address_2 || datum.local_contact_3_phone || datum.local_contact_3_fax || datum.local_contact_3_city || datum.local_contact_3_state || datum.local_contact_3_zip) {
                information += '<hr><h4><span data-value="' + addressFour + '" ' + (datum.local_contact_3_address_1 && datum.local_contact_3_city == 'Philadelphia' ? pinStyle : '') + '>' + Joomla.JText._('LOCAL OFFICE') + ' <a class="icon-map-marker icon-large"></a></a></h4><br>';
            }
            if (datum.local_contact_3_phone) {
                information += '<strong>' + Joomla.JText._('PHONE') + '</strong> <span class="phone">' + datum.local_contact_3_phone + '</span><br>';
            }
            if (datum.local_contact_3_fax) {
                information += '<strong>' + Joomla.JText._('FAX') + '</strong> <span class="phone">' + datum.local_contact_3_fax + '</span><br>';
            }
            if (datum.local_contact_3_address_1 || datum.local_contact_3_address_2 || datum.local_contact_3_city || datum.local_contact_3_state || datum.local_contact_3_zip) {
                information += '<br><strong>' + Joomla.JText._('OFFICE_ADDRESS') + '</strong><br>';
            }
            if (datum.local_contact_3_address_1) {
                information += datum.local_contact_3_address_1 + '<br>';
            }
            if (datum.local_contact_3_address_2) {
                information += datum.local_contact_3_address_2 + '<br>';
            }
            if (datum.local_contact_3_city) {
                information += datum.local_contact_3_city + ', ' + datum.local_contact_3_state + ' ' + datum.local_contact_3_zip + '<br>';
            }
            information += '</div>';
            var contact = '<div id="basic-' + guId + '" class="basic-official-info"><strong style="font-size:11px;">' + officer + '</strong> (' + datum.party + ')<br>' + office + ' ' + leadershipRole + '<br>';
            if (datum.email) {
                contact = contact + '<br><a href="mailto:' + datum.email + '" target="_top">' + Joomla.JText._('EMAIL') + ' <a class="icon-envelope-alt"></a></a>';
            }
            if (datum.website) {
                contact = contact + '<br><a href="https://' + datum.website + '" target="_blank">' + Joomla.JText._('WEBSITE') + ' <a class="icon-external-link"></a></a>';
            }
            contact = contact + '<br><span data-value="' + guId + '" class="more-info">' + Joomla.JText._('MORE INFORMATION') + ' <a class="icon-angle-right"></a></span><hr></div>';
            $(officeToId[office]).append(contact);
            $(officeToId[office]).append(information);
            if (office === 'Mayor') {
                mayorAddress = addressOne;
            }
            $('.phone').text(function(y, z) {
                return z.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
            });
        });
    }

    function dropOfficePin(address) {
        var officeLocation = getPhilaAddressData(address);
        officeLocation.done(function(data) {
            var exact = false;
            for (var ii = 0; ii <= data.features.length - 1; ii++) {
                var feature = data.features[ii];
                if (feature.match_type === 'exact') {
                    exact = true;
                    Markers.office = L.marker(coordsSwap(feature.geometry.coordinates), {
                        icon: Icons.congress,
                    });
                } else {}
            }
            if (!exact) {
                alert('Geocode of office failed: ' + data.status);
            }
            setTimeout(grouper, 650);
        }).fail(function(data) {
            dropOfficePin(mayorAddress)
        });
    }

    function getPhilaAddressData(input) {
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
        return {
            coordinates: [feature.geometry.coordinates[1], feature.geometry.coordinates[0]],
            style: service.style,
            data: feature.properties,
            name: input
        }
    }

    function getShapeFromService(input, service) {
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

    function getOldIndexes(input) {
        var deferred = $.Deferred(),
            service = Services.old_indexer;
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

    function setIndexes() {
        var indexes,
            shapedData = [];

        if (typeof LastAddressComplete != 'Array' && typeof LastAddressComplete.precinct == 'undefined' ) {
            LastAddressComplete = [];
        }

        LastAddressComplete.precinct = (!LastAddressComplete.precinct) ? wardDivision : LastAddressComplete.precinct;

        indexes = getIndexes(wardDivision)
        oldIndexes = getOldIndexes(LastAddressComplete.precinct)
        $.when(indexes, oldIndexes).done(function(idata, odata) {
            var ifeature, ofeature;
            ifeature = idata.features[0];
            ofeature = odata.features[0];
            shapedData.precinct = ifeature.precinct;
            if (shapedData.precinct != ofeature.precinct) {
                shapedData.precinct_old = ofeature.precinct;
            }
            shapedData.division = ifeature.division;
            if (ifeature.division != ofeature.division) {
                shapedData.division_old = ofeature.division;
            }
            shapedData.ward = ifeature.ward;
            if (ifeature.ward != ofeature.ward) {
                shapedData.ward_old = ofeature.ward;
            }
            shapedData.city_district = ifeature.city_district;
            if (ifeature.city_district != ofeature.city_district) {
                shapedData.city_district_old = ofeature.city_district;
            }
            shapedData.state_house = ifeature.state_house;
            if (ifeature.state_house != ofeature.state_house) {
                shapedData.state_house_old = ofeature.state_house;
            }
            shapedData.state_senate = ifeature.state_senate;
            if (ifeature.state_senate != ofeature.state_senate) {
                shapedData.state_senate_old = ofeature.state_senate;
            }
            shapedData.federal_house = ifeature.federal_house;
            if (ifeature.federal_house != ofeature.federal_house) {
                shapedData.federal_house_old = ofeature.federal_house;
            }

            AllIndexes = shapedData;
        }).then(function() {
            getVoterShapes();
            tabFunc();
            var timeout = 750;
            switch (getActive()) {
                case 'nav-my-maps':
                    setTimeout(function() {
                        GrouperContext = 'my.up';
                        $('#my-maps').show();
                        populateMySelect2Lists('#my-maps-selector', VoterShapes, 'district-type', '');
                    }, timeout)
                    break;
                default:
                    break;
            }
        }).fail(function(data) {});
    }

    function getVoterShapes() {
        if ("undefined" == typeof VoterShapes['Division (' + AllIndexes.precinct + ')'] && AllIndexes.precinct) {
            VoterShapes['Division (' + AllIndexes.precinct + ')'] = ''
            getShapeFromService(AllIndexes.precinct, Services.shape_city_division_them).done(function(data) {
                VoterShapes['Division (' + AllIndexes.precinct + ')'] = data
                drawShape(VoterShapes['Division (' + AllIndexes.precinct + ')'], 'home-division')
            }).fail(function(data) {
                console.log('precinct fail', data)
            });
        } else {
            drawShape(VoterShapes['Division (' + AllIndexes.precinct + ')'], 'home-division')
        }
        if ("undefined" == typeof VoterShapes['Division (previous: ' + AllIndexes.precinct_old + ')'] && AllIndexes.precinct_old) {
            VoterShapes['Division (previous: ' + AllIndexes.precinct_old + ')'] = ''
            getShapeFromService(AllIndexes.precinct_old, Services.shape_city_division).done(function(data) {
                VoterShapes['Division (previous: ' + AllIndexes.precinct_old + ')'] = data
            }).fail(function(data) {
                console.log('precinct_old fail', data)
            });
        }
        if ("undefined" == typeof VoterShapes['Ward (' + AllIndexes.ward + ')'] && AllIndexes.ward) {
            VoterShapes['Ward (' + AllIndexes.ward + ')'] = ''
            getShapeFromService(AllIndexes.ward, Services.shape_city_ward_them).done(function(data) {
                VoterShapes['Ward (' + AllIndexes.ward + ')'] = data
            }).fail(function(data) {
                console.log('ward fail', data)
            });
        }
        if ("undefined" == typeof VoterShapes['Ward (previous: ' + AllIndexes.ward_old + ')'] && AllIndexes.ward_old) {
            VoterShapes['Ward (previous: ' + AllIndexes.ward_old + ')'] = ''
            getShapeFromService(AllIndexes.ward_old, Services.shape_city_ward).done(function(data) {
                VoterShapes['Ward (previous: ' + AllIndexes.ward_old + ')'] = data
            }).fail(function(data) {
                console.log('ward_old fail', data)
            });
        }
        if ("undefined" == typeof VoterShapes['City Council (' + AllIndexes.city_district + ')'] && AllIndexes.city_district) {
            VoterShapes['City Council (' + AllIndexes.city_district + ')'] = ''
            getShapeFromService(AllIndexes.city_district, Services.shape_city_district_them).done(function(data) {
                VoterShapes['City Council (' + AllIndexes.city_district + ')'] = data
            }).fail(function(data) {
                console.log('city_district fail', data)
            });
        }
        if ("undefined" == typeof VoterShapes['City Council (previous: ' + AllIndexes.city_district_old + ')'] && AllIndexes.city_district_old) {
            VoterShapes['City Council (previous: ' + AllIndexes.city_district_old + ')'] = ''
            getShapeFromService(AllIndexes.city_district_old, Services.shape_city_district).done(function(data) {
                VoterShapes['City Council (previous: ' + AllIndexes.city_district_old + ')'] = data
            }).fail(function(data) {
                console.log('city_district_old fail', data)
            });
        }
        if ("undefined" == typeof VoterShapes['State Representative (' + AllIndexes.state_house + ')'] && AllIndexes.state_house) {
            VoterShapes['State Representative (' + AllIndexes.state_house + ')'] = ''
            getShapeFromService(AllIndexes.state_house, Services.shape_state_house_them).done(function(data) {
                VoterShapes['State Representative (' + AllIndexes.state_house + ')'] = data
            }).fail(function(data) {
                console.log('state_house fail', data)
            });
        }
        if ("undefined" == typeof VoterShapes['State Representative (previous: ' + AllIndexes.state_house_old + ')'] && AllIndexes.state_house_old) {
            VoterShapes['State Representative (previous: ' + AllIndexes.state_house_old + ')'] = ''
            getShapeFromService(AllIndexes.state_house_old, Services.shape_state_house).done(function(data) {
                VoterShapes['State Representative (previous: ' + AllIndexes.state_house_old + ')'] = data
            }).fail(function(data) {
                console.log('state_house_old fail', data)
            });
        }
        if ("undefined" == typeof VoterShapes['State Senate (' + AllIndexes.state_senate + ')'] && AllIndexes.state_senate) {
            VoterShapes['State Senate (' + AllIndexes.state_senate + ')'] = ''
            getShapeFromService(AllIndexes.state_senate, Services.shape_state_senate_them).done(function(data) {
                VoterShapes['State Senate (' + AllIndexes.state_senate + ')'] = data
            }).fail(function(data) {
                console.log('state_senate fail', data)
            });
        }
        if ("undefined" == typeof VoterShapes['State Senate (previous: ' + AllIndexes.state_senate_old + ')'] && AllIndexes.state_senate_old) {
            VoterShapes['State Senate (previous: ' + AllIndexes.state_senate_old + ')'] = ''
            getShapeFromService(AllIndexes.state_senate_old, Services.shape_state_senate).done(function(data) {
                VoterShapes['State Senate (previous: ' + AllIndexes.state_senate_old + ')'] = data
            }).fail(function(data) {
                console.log('state_senate_old fail', data)
            });
        }
        if ("undefined" == typeof VoterShapes['US Congress (' + AllIndexes.federal_house + ')'] && AllIndexes.federal_house) {
            VoterShapes['US Congress (' + AllIndexes.federal_house + ')'] = ''
            getShapeFromService(AllIndexes.federal_house, Services.shape_federal_house_them).done(function(data) {
                VoterShapes['US Congress (' + AllIndexes.federal_house + ')'] = data
            }).fail(function(data) {
                console.log('federal_house fail', data)
            });
        }
        if ("undefined" == typeof VoterShapes['US Congress (previous: ' + AllIndexes.federal_house_old + ')'] && AllIndexes.federal_house_old) {
            VoterShapes['US Congress (previous: ' + AllIndexes.federal_house_old + ')'] = ''
            getShapeFromService(AllIndexes.federal_house_old, Services.shape_federal_house_them_old).done(function(data) {
                VoterShapes['US Congress (previous: ' + AllIndexes.federal_house_old + ')'] = data
            }).fail(function(data) {
                console.log('federal_house_old fail', data)
            });
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

    // ui functions
    function showInfos() {
        $('#polling-place-intro').hide();
        $('#polling-place-info').show();
        $('#elected-officials-intro').hide();
        $('#elected-officials-info').show();
        //my maps stuff
        $('#maps-intro').hide();
        $('#maps-info').show();
    }

    function addDistrictToList(element, content, value, set) {
        element.append($('<option />').text(content).val(value).prop('disabled', !!set));
    }

    function tabFunc() {
        return tabFunctions[getActive()]();
    }

    function getActive() {
        return $('#nav').find('li.active').attr('id')
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



    function clearCustomMap() {
        $('.custom-map-selector').val([]).change();
    }



    function getSampleBallot() {
        var ward = AllIndexes.ward,
            division = AllIndexes.division,
            sample_div = ward + "-" + division,
            el_parent = $("#download-ballot-intro");

        if (typeof ward_divisions_files === 'undefined' || !ward_divisions_files) {

            var inner_html = '<h3>' + Joomla.JText._('DOWNLOAD BALLOT INTRO HEADER NO BALLOT') + '</h3><br/><p>' + Joomla.JText._('DOWNLOAD BALLOT INTRO TEXT NO BALLOT') + '</p>';
            $(el_parent).html(inner_html);
            $("#sample-pdf").html("");
            return;
        }
        if (typeof ward_divisions_files[sample_div] !== 'undefined') {
            if (typeof ward_divisions_files[sample_div].file_id !== 'undefined') {
                if (ward_divisions_files[sample_div].file_id != '') {

                    var pdf_url = baseUri + 'ballot_paper/' + ward_divisions_files[sample_div].file_id + '.pdf';

                    var html = '<object width="100%" height="100%" data="' + pdf_url + '?#zoom=0&amp;scrollbar=1&amp;toolbar=0&amp;navpanes=0" type="application/pdf">NO PDF FOUND</object>';

                    $("#sample-pdf").html(html);
                    var inner_html = '<h3>' + Joomla.JText._('DOWNLOAD BALLOT INTRO HEADER AFTER') + '</h3><br/><p>' + Joomla.JText._('DOWNLOAD BALLOT INTRO TEXT AFTER') + '</p><br/><a href="' + baseUri + 'ballot_paper/' + ward_divisions_files[sample_div].file_id + '.pdf" target="_blank" class="showPDF">' + Joomla.JText._('DOWNLOAD BALLOT BUTTON TEXT') + '</a>';
                    $(el_parent).html(inner_html);
                    /* Looping for other ballot */
                    var unique = [];
                    var unique_wards = [];
                    $.each(ward_divisions_files, function(i, val) {

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
                    $("#download-ballot-info").html(htm);
                    $("#download-ballot-info").show();
                    return;
                }
            }
        }

        var inner_html = '<h3>' + Joomla.JText._('DOWNLOAD BALLOT INTRO HEADER NO BALLOT') + '</h3><br/><p>' + Joomla.JText._('DOWNLOAD BALLOT INTRO TEXT NO BALLOT') + '</p>';
        $(el_parent).html(inner_html);
        $("#sample-pdf").html("");
    }

    function showBallotDropdown() {
        var b = $('#ballots_dropdown').val();
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
        $('#nav-elected-officials').removeClass('active');
        $('#nav-polling-place').removeClass('active');
        $('#nav-my-maps').removeClass('active');
        $('#nav-maps').removeClass('active');
        $('#nav-download-ballot').removeClass('active');
        $('#polling-place').hide();
        $('#elected-officials').hide();
        $('#my-maps').hide();
        $('#maps').hide();
        $('#download-ballot').hide();
    }

    function showTabElectedOfficials() {
        tabsReset();
        $('#nav-elected-officials').addClass('active');
        $('#elected-officials').show();
        addressNotEntered();
    }

    function showTabPollingplace() {
        tabsReset();
        $('#nav-polling-place').addClass('active');
        $('#polling-place').show();
        addressNotEntered();
    }

    function showTabMyMaps() {
        tabsReset();
        $('#nav-my-maps').addClass('active');
        $('#my-maps').show();
        populateMySelect2Lists('#my-maps-selector', VoterShapes, 'district-type', '');
        addressNotEntered();
    }

    function resetAllSelect2() {
        $('#my-maps-selector').empty();
        $('#custom-divisions').empty();
        $('#custom-wards').empty();
        $('#custom-council-districts').empty();
        $('#custom-parep-districts').empty();
        $('#custom-pasen-districts').empty();
        $('#custom-uscongress-districts').empty();
    }

    function showTabMaps() {
        tabsReset();
        var service = Services.indexer_list;
        $('#nav-maps').addClass('active');
        $('#maps').show();
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
        $('#nav-download-ballot').addClass('active');
        $('#download-ballot').show();
        addressNotEntered();
    }

    function populateSelect2Lists(elemId, data, index, url) {
        var $elem = $(elemId);
        $elem.empty()
        if (data) {
            if ('#custom-divisions' !== elemId) {
                $elem.append($('<option>').text('ALL'));
            }
            data.forEach(function(datum) {
                $elem.append($('<option>').text(datum[index]));
            });
            $elem.prop('disabled', false);
        } else {
            $.getJSON(url).done(function(datum) {
                data = datum;
                populateSelect2Lists(elemId, data, index, url);
            });
        }
        $elem.prop('disabled', false);
    }

    function populateMySelect2Lists(elemId, data, index, url) {
        var $elem = $(elemId);
        $elem.empty();
        for (var prop in data) {
            if (!data.hasOwnProperty(prop)) continue;
            $elem.append($('<option>').text(prop));
        }
        $elem.prop('disabled', false);
    }

    // utils
    $.support.cors = true;

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


    $(D).on('click', '.office-level-accordion > dt > a', function() {
        $('.office-level-accordion > dd').slideUp();
        if ($(this).hasClass('active')) {
            $(this).removeClass('active');
        } else {
            $(this).parent().next().slideDown();
            $(this).addClass('active');
        }
        return false;
    });
    $(D).on('click', '.office-accordion > dt > a', function() {
        $('.office-accordion > dd').slideUp();
        if ($(this).hasClass('active')) {
            $(this).removeClass('active');
        } else {
            $(this).parent().next().slideDown();
            $(this).addClass('active');
        }
        return false;
    });

    $(D).on('keydown', '#target', function(event) {
        if (event.key === 'Enter' && searchBox.value) {
            LastAddressComplete = [];
            addressEntered(1)
        }
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

        addressComplete();
        var params = getQueryParams(D.location.search);
        if (typeof params.address !== 'undefined') {
            searchBox.value = params.address;

            showInfos();
            setTimeout(function() {
                LastAddressComplete = [];
                addressEntered(1)

            }, 650)
        }
    });
}))