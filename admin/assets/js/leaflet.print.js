/*!
 * 
 *  leaflet.browser.print - v0.6.0 (https://github.com/Igor-Vladyka/leaflet.browser.print) 
 *  A leaflet plugin which allows users to print the map directly from the browser
 *  
 *  MIT (http://www.opensource.org/licenses/mit-license.php)
 *  (c) 2018  Igor Vladyka <igor.vladyka@gmail.com> (https://github.com/Igor-Vladyka/)
 * 
 */
! function(t) {
    function e(i) {
        if (n[i]) return n[i].exports;
        var r = n[i] = {
            i: i,
            l: !1,
            exports: {}
        };
        return t[i].call(r.exports, r, r.exports, e), r.l = !0, r.exports
    }
    var n = {};
    e.m = t, e.c = n, e.i = function(t) {
        return t
    }, e.d = function(t, n, i) {
        e.o(t, n) || Object.defineProperty(t, n, {
            configurable: !1,
            enumerable: !0,
            get: i
        })
    }, e.n = function(t) {
        var n = t && t.__esModule ? function() {
            return t.default
        } : function() {
            return t
        };
        return e.d(n, "a", n), n
    }, e.o = function(t, e) {
        return Object.prototype.hasOwnProperty.call(t, e)
    }, e.p = "", e(e.s = 3)
}([function(t, e) {
    L.Control.BrowserPrint = L.Control.extend({
        options: {
            title: "Print map",
            documentTitle: "",
            position: "topleft",
            printLayer: null,
            printModes: ["Portrait", "Landscape", "Auto", "Custom"],
            printModesNames: {
                Portrait: "Portrait",
                Landscape: "Landscape",
                Auto: "Auto",
                Custom: "Custom"
            },
            closePopupsOnPrint: !0,
            contentSelector: "[leaflet-browser-print-content]",
            pagesSelector: "[leaflet-browser-print-pages]",
            manualMode: !1
        },
        onAdd: function(t) {
            var e = L.DomUtil.create("div", "leaflet-control-browser-print leaflet-bar leaflet-control");
            return L.DomEvent.disableClickPropagation(e), this._appendControlStyles(e), L.DomEvent.addListener(e, "mouseover", this._displayPageSizeButtons, this), L.DomEvent.addListener(e, "mouseout", this._hidePageSizeButtons, this), this.options.position.indexOf("left") > 0 ? (this._createIcon(e), this._createMenu(e)) : (this._createMenu(e), this._createIcon(e)), setTimeout(function() {
                e.className += parseInt(L.version) ? " v1" : " v0-7"
            }, 10), t.printControl = this, e
        },
        _createIcon: function(t) {
            var e = L.DomUtil.create("a", "", t);
            return this.link = e, this.link.id = "leaflet-browser-print", this.options.title && (this.link.title = this.options.title), this.link
        },
        _createMenu: function(t) {
            this.holder = L.DomUtil.create("ul", "browser-print-holder", t);
            for (var e = [], n = 0; n < this.options.printModes.length; n++) {
                var i = this.options.printModes[n];
                if (i.length) {
                    var r = i[0].toUpperCase() + i.substring(1).toLowerCase();
                    i = L.control.browserPrint.mode(r, this._getDefaultTitle(r))
                } else if (i instanceof L.Control.BrowserPrint.Mode) {
                    if (!i.Mode) continue;
                    i.Title = i.Title || this._getDefaultTitle(i.Mode), i.PageSize = i.PageSize || "A4", i.Action = i.Action || "_print" + i.Mode
                }
                i.Element = L.DomUtil.create("li", "browser-print-mode", this.holder), i.Element.innerHTML = i.Title, L.DomEvent.addListener(i.Element, "click", this[i.Action], this), e.push(i)
            }
            this.options.printModes = e
        },
        _getDefaultTitle: function(t) {
            return this.options.printModesNames && this.options.printModesNames[t] || t
        },
        _displayPageSizeButtons: function() {
            this.options.position.indexOf("left") > 0 ? (this.link.style.borderTopRightRadius = "0px", this.link.style.borderBottomRightRadius = "0px") : (this.link.style.borderTopLeftRadius = "0px", this.link.style.borderBottomLeftRadius = "0px"), this.options.printModes.forEach(function(t) {
                t.Element.style.display = "inline-block"
            })
        },
        _hidePageSizeButtons: function() {
            this.options.position.indexOf("left") > 0 ? (this.link.style.borderTopRightRadius = "", this.link.style.borderBottomRightRadius = "") : (this.link.style.borderTopLeftRadius = "", this.link.style.borderBottomLeftRadius = ""), this.options.printModes.forEach(function(t) {
                t.Element.style.display = ""
            })
        },
        _getMode: function(t) {
            return this.options.printModes.filter(function(e) {
                return e.Mode == t
            })[0]
        },
        _printLandscape: function() {
            this._addPrintClassToContainer(this._map, "leaflet-browser-print--landscape");
            this._print(this._getMode("Landscape"), "Landscape")
        },
        _printPortrait: function() {
            this._addPrintClassToContainer(this._map, "leaflet-browser-print--portrait");
            this._print(this._getMode("Portrait"), "Portrait")
        },
        _printAuto: function() {
            this._addPrintClassToContainer(this._map, "leaflet-browser-print--auto");
            var t = this._getBoundsForAllVisualLayers(),
                e = this._getPageSizeFromBounds(t);
            this._print(this._getMode(e), e, t)
        },
        _printCustom: function() {
            this._addPrintClassToContainer(this._map, "leaflet-browser-print--custom"), this._map.on("mousedown", this._startAutoPoligon, this)
        },
        _addPrintClassToContainer: function(t, e) {
            var n = t.getContainer(); - 1 === n.className.indexOf(e) && (n.className += " " + e)
        },
        _removePrintClassFromContainer: function(t, e) {
            var n = t.getContainer();
            n.className && n.className.indexOf(e) > -1 && (n.className = n.className.replace(" " + e, ""))
        },
        _startAutoPoligon: function(t) {
            t.originalEvent.preventDefault(), t.originalEvent.stopPropagation(), this._map.dragging.disable(), this.options.custom = {
                start: t.latlng
            }, this._map.off("mousedown", this._startAutoPoligon, this), this._map.on("mousemove", this._moveAutoPoligon, this), this._map.on("mouseup", this._endAutoPoligon, this)
        },
        _moveAutoPoligon: function(t) {
            this.options.custom && (t.originalEvent.preventDefault(), t.originalEvent.stopPropagation(), this.options.custom.rectangle ? this.options.custom.rectangle.setBounds(L.latLngBounds(this.options.custom.start, t.latlng)) : (this.options.custom.rectangle = L.rectangle([this.options.custom.start, t.latlng], {
                color: "gray",
                dashArray: "5, 10"
            }), this.options.custom.rectangle.addTo(this._map)))
        },
        _endAutoPoligon: function(t) {
            if (t.originalEvent.preventDefault(), t.originalEvent.stopPropagation(), this._map.off("mousemove", this._moveAutoPoligon, this), this._map.off("mouseup", this._endAutoPoligon, this), this._map.dragging.enable(), this.options.custom && this.options.custom.rectangle) {
                var e = this.options.custom.rectangle.getBounds();
                this._map.removeLayer(this.options.custom.rectangle), this.options.custom = void 0;
                var n = this._getPageSizeFromBounds(e);
                this._print(this._getMode(n), n, e)
            } else this._clearPrint()
        },
        _getPageSizeFromBounds: function(t) {
            return Math.abs(t.getNorth() - t.getSouth()) > Math.abs(t.getEast() - t.getWest()) ? "Portrait" : "Landscape"
        },
        _setupPrintPagesWidth: function(t, e, n) {
            switch (n) {
                case "Landscape":
                    t.style.width = e.Height;
                    break;
                default:
                case "Portrait":
                    t.style.width = e.Width
            }
        },
        _setupPrintMapHeight: function(t, e, n) {
            switch (n) {
                case "Landscape":
                    t.style.height = e.Width;
                    break;
                default:
                case "Portrait":
                    t.style.height = e.Height
            }
        },
        cancel: function(t) {
            this.cancelNextPrinting = t
        },
        print: function(t, e) {
            "Landscape" != t && "Portrait" != t || this._print(this._getMode(t), t, e)
        },
        _print: function(t, e, n) {
            var i = this,
                r = this._map.getContainer(),
                o = {
                    bounds: n || this._map.getBounds(),
                    width: r.style.width,
                    height: r.style.height,
                    documentTitle: document.title,
                    printLayer: L.Control.BrowserPrint.Utils.cloneLayer(this.options.printLayer),
                    panes: []
                },
                a = this._map.getPanes();
            for (var s in a) o.panes.push({
                name: s,
                container: void 0
            });
            if (o.printObjects = this._getPrintObjects(o.printLayer), this._map.fire(L.Control.BrowserPrint.Event.PrePrint, {
                    printLayer: o.printLayer,
                    printObjects: o.printObjects,
                    pageOrientation: e,
                    printMode: t.Mode,
                    pageBounds: o.bounds
                }), this.cancelNextPrinting) return void delete this.cancelNextPrinting;
            var l = this._addPrintMapOverlay(t.PageSize, t.getPageMargin(), t.getSize(), e, o);
            this.options.documentTitle && (document.title = this.options.documentTitle), this._map.fire(L.Control.BrowserPrint.Event.PrintStart, {
                printLayer: o.printLayer,
                printMap: l.map,
                printObjects: l.objects
            }), l.map.fitBounds(o.bounds), l.map.invalidateSize({
                reset: !0,
                animate: !1,
                pan: !1
            });
            var p = setInterval(function() {
                i._isTilesLoading(l.map) || (clearInterval(p), i.options.manualMode ? i._setupManualPrintButton(l.map, o, l.objects) : i._completePrinting(l.map, o, l.objects))
            }, 50)
        },
        _completePrinting: function(t, e, n) {
            var i = this;
            setTimeout(function() {
                i._map.fire(L.Control.BrowserPrint.Event.Print, {
                    printLayer: e.printLayer,
                    printMap: t,
                    printObjects: n
                }), window.print(), i._printEnd(e), i._map.fire(L.Control.BrowserPrint.Event.PrintEnd, {
                    printLayer: e.printLayer,
                    printMap: t,
                    printObjects: n
                })
            }, 1e3)
        },
        _getBoundsForAllVisualLayers: function() {
            var t = null;
            for (var e in this._map._layers) {
                var n = this._map._layers[e];
                n._url || (t ? n.getBounds ? t.extend(n.getBounds()) : n.getLatLng && t.extend(n.getLatLng()) : n.getBounds ? t = n.getBounds() : n.getLatLng && (t = L.latLngBounds(n.getLatLng(), n.getLatLng())))
            }
            return t
        },
        _clearPrint: function() {
            this._removePrintClassFromContainer(this._map, "leaflet-browser-print--landscape"), this._removePrintClassFromContainer(this._map, "leaflet-browser-print--portrait"), this._removePrintClassFromContainer(this._map, "leaflet-browser-print--auto"), this._removePrintClassFromContainer(this._map, "leaflet-browser-print--custom")
        },
        _printEnd: function(t) {
            this._clearPrint();
            var e = document.getElementById("leaflet-print-overlay");
            document.body.removeChild(e), document.body.className = document.body.className.replace(" leaflet--printing", ""), this.options.documentTitle && (document.title = t.documentTitle), this._map.invalidateSize({
                reset: !0,
                animate: !1,
                pan: !1
            })
        },
        _getPrintObjects: function(t) {
            var e = {};
            for (var n in this._map._layers) {
                var i = this._map._layers[n];
                if (!t || !i._url || t._url !== i._url) {
                    var r = L.Control.BrowserPrint.Utils.getType(i);
                    r && (e[r] || (e[r] = []), e[r].push(i))
                }
            }
            return e
        },
        _addPrintCss: function(t, e, n) {
            var i = document.createElement("style");
            switch (i.id = "leaflet-browser-print-css", i.setAttribute("type", "text/css"), i.innerHTML = " @media print { .leaflet-popup-content-wrapper, .leaflet-popup-tip { box-shadow: none; }", i.innerHTML += " #leaflet-browser-print--manualMode-button { display: none; }", i.innerHTML += " * { -webkit-print-color-adjust: exact!important; }", e && (i.innerHTML += " @page { margin: " + e + "; }"), i.innerHTML += " @page :first { page-break-after: always; }", n) {
                case "Landscape":
                    i.innerText += " @page { size : " + t + " landscape; }";
                    break;
                default:
                case "Portrait":
                    i.innerText += " @page { size : " + t + " portrait; }"
            }
            return i
        },
        _appendControlStyles: function(t) {
            var e = document.createElement("style");
            e.setAttribute("type", "text/css"), e.innerHTML += " .leaflet-control-browser-print { display: flex; } .leaflet-control-browser-print a { background: #fff url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3gcCCi8Vjp+aNAAAAGhJREFUOMvFksENgDAMA68RC7BBN+Cf/ZU33QAmYAT6BolAGxB+RrrIsg1BpfNBVXcPMLMDI/ytpKozMHWwK7BJJ7yYWQbGdBea9wTIkRDzKy0MT7r2NiJACRgotCzxykFI34QY2Ea7KmtxGJ+uX4wfAAAAAElFTkSuQmCC') no-repeat 5px; background-size: 16px 16px; display: block; border-radius: 4px; }", e.innerHTML += " .v0-7.leaflet-control-browser-print a#leaflet-browser-print { width: 26px; height: 26px; } .v1.leaflet-control-browser-print a#leaflet-browser-print { background-position-x: 7px; }", e.innerHTML += " .browser-print-holder { margin: 0px; padding: 0px; list-style: none; white-space: nowrap; } .browser-print-holder-left li:last-child { border-top-right-radius: 2px; border-bottom-right-radius: 2px; } .browser-print-holder-right li:first-child { border-top-left-radius: 2px; border-bottom-left-radius: 2px; }", e.innerHTML += " .browser-print-mode { display: none; background-color: #919187; color: #FFF; font: 11px/19px 'Helvetica Neue', Arial, Helvetica, sans-serif; text-decoration: none; padding: 4px 10px; text-align: center; } .v1 .browser-print-mode { padding: 6px 10px; } .browser-print-mode:hover { background-color: #757570; cursor: pointer; }", e.innerHTML += " .leaflet-browser-print--custom, .leaflet-browser-print--custom path { cursor: crosshair!important; }", e.innerHTML += " .leaflet-print-overlay { width: 100%; height:auto; min-height: 100%; position: absolute; top: 0; background-color: white!important; left: 0; z-index: 1001; display: block!important; } ", e.innerHTML += " .leaflet--printing { height:auto; min-height: 100%; margin: 0px!important; padding: 0px!important; } body.leaflet--printing > * { display: none; box-sizing: border-box; }", e.innerHTML += " .grid-print-container { grid-template: 1fr / 1fr; box-sizing: border-box; } .grid-map-print { grid-row: 1; grid-column: 1; } body.leaflet--printing .grid-print-container [leaflet-browser-print-content]:not(style) { display: unset!important; }", e.innerHTML += " .pages-print-container { box-sizing: border-box; }", t.appendChild(e)
        },
        _setupManualPrintButton: function(t, e, n) {
            var i = document.createElement("button");
            i.id = "leaflet-browser-print--manualMode-button", i.innerHTML = "Print", i.style.position = "absolute", i.style.top = "20px", i.style.right = "20px", document.querySelector("#leaflet-print-overlay").appendChild(i);
            var r = this;
            L.DomEvent.addListener(i, "click", function() {
                r._completePrinting(t, e, n)
            })
        },
        _addPrintMapOverlay: function(t, e, n, i, r) {
            var o = document.createElement("div");
            o.id = "leaflet-print-overlay", o.className = this._map.getContainer().className + " leaflet-print-overlay", document.body.appendChild(o), o.appendChild(this._addPrintCss(t, e, i));
            var a = document.createElement("div");
            if (a.id = "grid-print-container", a.className = "grid-print-container", a.style.width = "100%", a.style.display = "grid", this._setupPrintMapHeight(a, n, i), this.options.contentSelector) {
                var s = document.querySelectorAll(this.options.contentSelector);
                if (s && s.length)
                    for (var l = 0; l < s.length; l++) {
                        var p = s[l].cloneNode(!0);
                        a.appendChild(p)
                    }
            }
            if (this.options.pagesSelector && document.querySelectorAll(this.options.pagesSelector).length) {
                var c = document.createElement("div");
                c.id = "pages-print-container", c.className = "pages-print-container", c.style.margin = "0!important", this._setupPrintPagesWidth(c, n, i), o.appendChild(c), c.appendChild(a);
                var u = document.querySelectorAll(this.options.pagesSelector);
                if (u && u.length)
                    for (var l = 0; l < u.length; l++) {
                        var d = u[l].cloneNode(!0);
                        c.appendChild(d)
                    }
            } else this._setupPrintPagesWidth(a, n, i), o.appendChild(a);
            var h = document.createElement("div");
            return h.id = this._map.getContainer().id + "-print", h.className = "grid-map-print", h.style.width = "100%", h.style.height = "100%", a.appendChild(h), document.body.className += " leaflet--printing", this._setupPrintMap(h.id, L.Control.BrowserPrint.Utils.cloneBasicOptionsWithoutLayers(this._map.options), r.printLayer, r.printObjects, r.panes)
        },
        _setupPrintMap: function(t, e, n, i, r) {
            e.zoomControl = !1;
            var o = L.map(t, e);
            n && n.addTo(o), r.forEach(function(t) {
                o.createPane(t.name, t.container)
            });
            for (var a in i) {
                var s = this.options.closePopupsOnPrint;
                i[a] = i[a].map(function(t) {
                    var e = L.Control.BrowserPrint.Utils.cloneLayer(t);
                    if (e) {
                        if (t instanceof L.Popup ? (t.isOpen || (t.isOpen = function() {
                                return this._isOpen
                            }), t.isOpen() && !s && e.openOn(o)) : e.addTo(o), t instanceof L.Layer) {
                            var n = t.getTooltip();
                            n && (e.bindTooltip(n.getContent(), n.options), t.isTooltipOpen() && e.openTooltip(n.getLatLng()))
                        }
                        return e
                    }
                })
            }
            return {
                map: o,
                objects: i
            }
        },
        _isTilesLoading: function(t) {
            return parseFloat(L.version) > 1 ? this._getLoadingLayers(t) : t._tilesToLoad || t._tileLayersToLoad
        },
        _getLoadingLayers: function(t) {
            for (var e in t._layers) {
                var n = t._layers[e];
                if (n._url && n._loading) return !0
            }
            return !1
        }
    }), L.Control.BrowserPrint.Event = {
        PrePrint: "browser-pre-print",
        PrintStart: "browser-print-start",
        Print: "browser-print",
        PrintEnd: "browser-print-end"
    }, L.control.browserPrint = function(t) {
        if (t && t.printModes && (!t.printModes.filter || !t.printModes.length)) throw "Please specify valid print modes for Print action. Example: printModes: ['Portrait', 'Landscape', 'Auto', 'Custom']";
        return new L.Control.BrowserPrint(t)
    }, L.browserPrint = function(t) {
        return console.log("L.browserPrint(options) is obsolete and will be removed shortly, please use L.control.browserPrint(options) instead."), L.control.browserPrint(t)
    }
}, function(t, e) {
    L.Control.BrowserPrint.Size = {
        A: {
            Width: 841,
            Height: 1189
        },
        B: {
            Width: 1e3,
            Height: 1414
        }
    }, L.Control.BrowserPrint.Mode = function(t, e, n, i) {
        if (!t) throw "Print mode should be specified.";
        this.Mode = t, this.Title = e || t, this.PageSize = (n || "A4").toUpperCase(), this.PageSeries = this.PageSize[0], this.PageSeriesSize = parseInt(this.PageSize.substring(1)), this.Action = i || "_print" + t
    }, L.Control.BrowserPrint.Mode.prototype.getPageMargin = function() {
        var t = this.getPaperSize();
        return Math.floor((t.Width + t.Height) / 40) + "mm"
    }, L.Control.BrowserPrint.Mode.prototype.getPaperSize = function() {
        var t = L.Control.BrowserPrint.Size[this.PageSeries],
            e = t.Width,
            n = t.Height,
            i = !1;
        return this.PageSeriesSize && (i = this.PageSeriesSize % 2 == 1, i ? (e /= this.PageSeriesSize - 1 || 1, n /= this.PageSeriesSize + 1) : (e /= this.PageSeriesSize, n /= this.PageSeriesSize)), {
            Width: i ? n : e,
            Height: i ? e : n
        }
    }, L.Control.BrowserPrint.Mode.prototype.getSize = function() {
        var t = this.getPaperSize(),
            e = parseInt(this.getPageMargin()),
            n = function(t) {
                return e ? t - 2 * e : t
            };
        return t.Width = Math.floor(n(t.Width)) + "mm", t.Height = Math.floor(n(t.Height)) + "mm", t
    }, L.control.browserPrint.mode = function(t, e, n, i, r) {
        return new L.Control.BrowserPrint.Mode(t, e, n, i, r)
    }
}, function(t, e) {
    L.Control.BrowserPrint.Utils = {
        cloneOptions: function(t) {
            var e = this,
                n = {};
            for (var i in t) {
                var r = t[i];
                r && r.clone ? n[i] = r.clone() : r && r.onAdd ? n[i] = e.cloneLayer(r) : n[i] = r
            }
            return n
        },
        cloneBasicOptionsWithoutLayers: function(t) {
            var e = {},
                n = Object.getOwnPropertyNames(t);
            if (n.length) {
                for (var i = 0; i < n.length; i++) {
                    var r = n[i];
                    r && "layers" != r && (e[r] = t[r])
                }
                return this.cloneOptions(e)
            }
            return e
        },
        cloneLayer: function(t) {
            if (!t) return null;
            var e = this,
                n = t.options;
            return L.SVG && t instanceof L.SVG ? L.svg(n) : L.Canvas && t instanceof L.Canvas ? L.canvas(n) : L.TileLayer.WMS && t instanceof L.TileLayer.WMS ? L.tileLayer.wms(t._url, n) : t instanceof L.TileLayer ? L.tileLayer(t._url, n) : t instanceof L.ImageOverlay ? L.imageOverlay(t._url, t._bounds, n) : t instanceof L.Marker ? L.marker(t.getLatLng(), n) : t instanceof L.Popup ? L.popup(n).setLatLng(t.getLatLng()).setContent(t.getContent()) : t instanceof L.Circle ? L.circle(t.getLatLng(), t.getRadius(), n) : t instanceof L.CircleMarker ? L.circleMarker(t.getLatLng(), n) : t instanceof L.Rectangle ? L.rectangle(t.getBounds(), n) : t instanceof L.Polygon ? L.polygon(t.getLatLngs(), n) : L.MultiPolyline && t instanceof L.MultiPolyline ? L.polyline(t.getLatLngs(), n) : L.MultiPolygon && t instanceof L.MultiPolygon ? L.multiPolygon(t.getLatLngs(), n) : t instanceof L.Polyline ? L.polyline(t.getLatLngs(), n) : t instanceof L.GeoJSON ? L.geoJson(t.toGeoJSON(), n) : t instanceof L.FeatureGroup ? L.featureGroup(e.cloneInnerLayers(t)) : t instanceof L.LayerGroup ? L.layerGroup(e.cloneInnerLayers(t)) : t instanceof L.Tooltip ? null : (console.info("Unknown layer, cannot clone this layer. Leaflet-version: " + L.version), null)
        },
        getType: function(t) {
            return L.SVG && t instanceof L.SVG ? "L.SVG" : L.Canvas && t instanceof L.Canvas ? "L.Canvas" : t instanceof L.TileLayer.WMS ? "L.TileLayer.WMS" : t instanceof L.TileLayer ? "L.TileLayer" : t instanceof L.ImageOverlay ? "L.ImageOverlay" : t instanceof L.Marker ? "L.Marker" : t instanceof L.Popup ? "L.Popup" : t instanceof L.Circle ? "L.Circle" : t instanceof L.CircleMarker ? "L.CircleMarker" : t instanceof L.Rectangle ? "L.Rectangle" : t instanceof L.Polygon ? "L.Polygon" : L.MultiPolyline && t instanceof L.MultiPolyline ? "L.MultiPolyline" : L.MultiPolygon && t instanceof L.MultiPolygon ? "L.MultiPolygon" : t instanceof L.Polyline ? "L.Polyline" : t instanceof L.GeoJSON ? "L.GeoJSON" : t instanceof L.FeatureGroup ? "L.FeatureGroup" : t instanceof L.LayerGroup ? "L.LayerGroup" : t instanceof L.Tooltip ? "L.Tooltip" : null
        },
        cloneInnerLayers: function(t) {
            var e = this,
                n = [];
            return t.eachLayer(function(t) {
                var i = e.cloneLayer(t);
                i && n.push(i)
            }), n
        }
    }
}, function(t, e, n) {
    n(0), n(2), t.exports = n(1)
}]);