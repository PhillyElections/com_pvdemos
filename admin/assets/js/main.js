var place = (function(d) {
  'use strict';
  // instantiate 
  var inner = {},
    outer = {};
  // fallback center of map
  inner.cityHall = {
    lat: 39.95238,
    lng: -75.16359
  };
  // Coordinate data
  inner.coords = {};
  // Coordinate elements
  inner.elements = {};
  // intermediary between return and form
  inner.formData = {};
  inner.images = {
    'building': 'components/com_pvpollingplaces/assets/images/b.png',
    'entrance': 'components/com_pvpollingplaces/assets/images/e.png',
    'accessible': 'components/com_pvpollingplaces/assets/images/h.png'
  };
  inner.markers = {};
  inner.markers.listener = null;
  inner.types = ['building', 'entrance', 'accessible'];
  // map of data we're going to use
  inner.returnData = {
    street_number: 'short_name',
    route: 'long_name',
    locality: 'long_name',
    administrative_area_level_1: 'short_name',
    postal_code: 'short_name'
  };

  // initialize markers and coordinate elements
  for (var type of inner.types) {
    inner.markers[type] = false;
    inner.elements[type] = {};
  }

  //*** private methods ***//
  // Coordinate handling
  inner.bindCoords = function() {
    inner.elements.building.lat = d.getElementById('lat');
    inner.elements.building.lng = d.getElementById('lng');
    inner.elements.entrance.lat = d.getElementById('elat');
    inner.elements.entrance.lng = d.getElementById('elng');
    inner.elements.accessible.lat = d.getElementById('alat');
    inner.elements.accessible.lng = d.getElementById('alng');
  };
  inner.clearCoords = function() {
    for (var type of inner.types) {
      if (inner.elements[type].lat.value != 0) {
        d.getElementById('display-' + type).textContent = null;
      }
    }
    inner.elements.building.lat.value = '';
    inner.elements.building.lng.value = '';
    inner.elements.entrance.lat.value = '';
    inner.elements.entrance.lng.value = '';
    inner.elements.accessible.lat.value = '';
    inner.elements.accessible.lng.value = '';
  };
  inner.displayCoords = function() {
    for (var type of inner.types) {
      if (inner.elements[type].lat.value != 0) {
        d.getElementById('display-' + type).textContent = inner.elements[type].lat.value + "," + inner.elements[type].lng.value;
      }
    }
  };
  inner.storeCoords = function() {
    for (var type of inner.types) {
      inner.coords[type] = {
        lat: parseFloat(inner.elements[type].lat.value),
        lng: parseFloat(inner.elements[type].lng.value)
      };
    }
  };

  // Marker listeners
  inner.addListener = function(type, title) {
    // we only allow one listener at a time
    inner.dropListener();
    inner.markers.listener = google.maps.event.addListener(inner.map, 'click', function(event) {
      //call function to create marker
      inner.destroyMarker(type);
      inner.markers[type] = inner.createMarker(event.latLng, inner.images[type], title);
      inner.elements[type].lat.value = event.latLng.lat();
      inner.elements[type].lng.value = event.latLng.lng();
      inner.displayCoords();
    });
  };
  inner.dropListener = function() {
    google.maps.event.removeListener(inner.markers.listener);
  };

  // Market handlers
  inner.createMarker = function(coords, image, title) {
    return new google.maps.Marker({
      position: coords,
      map: inner.map,
      title: title,
      icon: image
    });
  };
  inner.destroyMarker = function(type) {
    if (inner.markers[type] && typeof inner.markers[type].setMap === 'function') {
      inner.markers[type].setMap(null);
      inner.markers[type] = null;
    }
  };
  inner.clearMarkers = function() {
    inner.types.forEach(function(type) {
      inner.destroyMarker(type);
    });
  };
  inner.setBuilding = function(loc) {
    inner.clearMarkers();
    inner.clearCoords();
    inner.elements.building.lat.value = loc.lat();
    inner.elements.building.lng.value = loc.lng();
    inner.displayCoords();
    inner.storeCoords();
    inner.markers['building'] = inner.createMarker(loc, inner.images['building'], 'Building');
    inner.geolocate(inner.coords.building);
  };
  inner.findByName = function() {
    var keyword = d.getElementById('location').value.replace(/\s+/g, '+') + ",Philadelphia";
    var placesService = new google.maps.places.PlacesService(inner.map);
    var request = {
      location: inner.cityHall,
      radius: 15000,
      keyword: keyword
    };

    if (inner.coords.building.lat) {
      request.location = inner.coords.building;
      request.radius = 1000;
    }

    placesService.nearbySearch(request, function(results, status) {
      if (status !== "OK" || typeof results[0] == "undefined") {
        alert('Find By Name Failed :(');
        return false;
      }

      inner.setBuilding(results[0].geometry.location);
    });
  };

  inner.geolocate = function(loc) {
    // set center to city hall
    var circle = new window.google.maps.Circle({
      center: loc,
      radius: 5000
    });
    inner.searchBox.setBounds(circle.getBounds());
  };

  inner.fillInAddress = function() {
    // Get the place details from the inner.searchBox object.
    var places = inner.searchBox.getPlaces();
    var bounds = new google.maps.LatLngBounds();

    if (places.length == 0) {
      return;
    }

    places.forEach(function(place) {
      if (!place.geometry) {
        alert('No coordinates returned for this address');
        return;
      }

      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
      for (var i = 0; i < place.address_components.length; i++) {
        var addressType = place.address_components[i].types[0];
        if (inner.returnData[addressType]) {
          var val = place.address_components[i][inner.returnData[addressType]];
          inner.formData[addressType] = val;
        }
      }
      d.getElementById('pin_address').value = inner.formData['street_number'] + ' ' + inner.formData['route'];
      d.getElementById('zip_code').value = inner.formData['postal_code'];
      inner.setBuilding(place.geometry.location);
    });
    inner.map.fitBounds(bounds);
  };

  //*** public methods ***//
  outer.createMap = function(loc) {
    if (typeof loc === 'undefined') {
      var loc = inner.cityHall;
      if (inner.coords.building.lat) {
        loc = inner.coords.building;
      }
    }

    inner.map = new google.maps.Map(d.getElementById('map'), {
      center: loc,
      zoom: 19,
    });

    inner.types.forEach(function(type) {
      if (inner.coords[type].lat)
        inner.markers[type] = inner.createMarker(inner.coords[type], inner.images[type], inner.coordsName);
    });

    // Create the inner.searchBox object, restricting the search to geographical
    if (typeof inner.searchBox === 'undefined') {
      inner.searchBox = new google.maps.places.SearchBox(
        // @type {!HTMLInputElement} 
        d.getElementById('pin_address'), {
          types: ['geocode']
        });
      // When the user selects an address from the dropdown, populate the address
      // fields in the form.
      inner.searchBox.addListener('places_changed', function() {
        inner.fillInAddress();
      });
    }

    inner.geolocate(loc);
  };

  outer.init = function() {
    var markers = d.querySelectorAll("ul.markers li.marker");
    var cancel = d.querySelectorAll("ul.markers li.marker-cancel");
    var clear = d.querySelectorAll("ul.markers li.marker-clear");
    var find = d.querySelectorAll("span.btn");
    var script = d.createElement('script');
    script.id = '_gmaps';
    script.type = 'text/javascript';
    script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=places&callback=place.createMap&key=AIzaSyDKUKOnN7xvUV31IcZrXFYYqtLYrkO38hw';
    d.body.appendChild(script);

    inner.bindCoords();
    inner.displayCoords();
    inner.storeCoords();
    for (var i = 0; i < markers.length; i++) {
      markers[i].addListener('click', function() {
        inner.addListener(this.dataset.marker, this.textContent || this.innerText || '');
      });
    }
    cancel[0].addListener('click', function() {
      inner.dropListener()
    });
    clear[0].addListener('click', function() {
      inner.dropListener();
      inner.clearMarkers();
      inner.clearCoords();
      inner.displayCoords();
    });
    find[0].addListener('click', function() {
      inner.findByName()
    });
  };

  outer.noComplete = function() {
    inner.searchBox.unbindAll();
    google.maps.event.clearInstanceListeners(d.getElementById('pin_address'));
    inner.located = false;
  };

  return outer;
})(document);

window.addEvent('domready', function() {
  place.init();
});