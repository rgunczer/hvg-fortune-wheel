'use strict';

const wheelConfig = (function () {

    let config = {
        "flashing-color": "#ffffff",
        "flashing-time": {
            "range-min": 0,
            "range-max": 300,
            "value": 100
        },
        "speed-min": {
            "range-min": 60,
            "range-max": 90,
            "value": 70
        },
        "speed-max": {
            "range-min": 60,
            "range-max": 90,
            "value": 80
        },
        "shadow-range-min": -50,
        "shadow-range-max": 50,
        "visuals": {
            "collision-circles": {
                "visible": false
            },
            "dividers": {
                "visible": true,
                "color": "#ffffff",
                "scale": "0",
                "shadow": {
                    "color": "#ffffff",
                    "blur": 10,
                    "offsetx": 0,
                    "offsety": 0
                }
            },
            "rods-main": {
                "visible": true,
                "color": "#ADD8E6",
                "scale": 20,
                "shadow": {
                    "color": "#000000",
                    "blur": "23",
                    "offsetx": "0",
                    "offsety": "3"
                }
            },
            "rods-sub": {
                "visible": true,
                "color": "#ADD8E6",
                "scale": 20,
                "shadow": {
                    "color": "#000000",
                    "blur": 14,
                    "offsetx": 4,
                    "offsety": 4
                }
            },
            "texts": {
                "visible": false,
                "color": "#ffffff",
                "scale": "30",
                "offset": "416",
                "offset-max": 600,
                "font-face": "TCSFamilyBold",
                "shadow": {
                    "color": "#400040",
                    "blur": "10",
                    "offsetx": "0",
                    "offsety": "0"
                },
                "stroke": {
                    "visible": false,
                    "color": "#1a1a1a",
                    "width": "0"
                }
            },
            "slicesimages": {
                "visible": true,
                "scale": "30",
                "offset": "70",
                "shadow": {
                    "color": "#ffffff",
                    "blur": 3,
                    "offsetx": 0,
                    "offsety": 0
                }
            },
            "center": {
                "visible": true,
                "color": "#2485c2",
                "scale": 20,
                "shadow": {
                    "color": "#000000",
                    "blur": 14,
                    "offsetx": 0,
                    "offsety": 0
                }
            },
            "center-logo": {
                "visible": true,
                "scale": "20",
                "shadow": {
                    "color": "#000000",
                    "blur": 2,
                    "offsetx": 0,
                    "offsety": 2
                }
            },
            "inner-ring": {
                "visible": true,
                "color": "#8b75c6",
                "scale": "20",
                "shadow": {
                    "color": "#000000",
                    "blur": "20",
                    "offsetx": "0",
                    "offsety": "-5"
                }
            },
            "outer-ring-1": {
                "visible": true,
                "color": "#2564c2",
                "scale": 37,
                "shadow": {
                    "color": "#000000",
                    "blur": "45",
                    "offsetx": "6",
                    "offsety": "6"
                }
            },
            "outer-ring-2": {
                "visible": true,
                "color": "#2564c2",
                "scale": "26",
                "shadow": {
                    "color": "#000000",
                    "blur": "40",
                    "offsetx": "0",
                    "offsety": "0"
                }
            },
            "tongue": {
                "visible": true,
                "outline": {
                    "color": "#ADD8E6"
                },
                "inner": {
                    "color": "#c0c0c0",
                    "alpha": 0.4
                },
                "shadow": {
                    "color": "#000000",
                    "blur": 15,
                    "offsetx": 0,
                    "offsety": 0
                }
            },
            "slice-00": {
                "visible": true,
                "color": "#e4342d",
                "text": "Life Science",
                "icon": "life"
            },
            "slice-01": {
                "visible": true,
                "color": "#ac7bad",
                "text": "Internship",
                "icon": "internship"
            },
            "slice-02": {
                "visible": true,
                "color": "#803585",
                "text": "Corporate",
                "icon": "corporate"
            },
            "slice-03": {
                "visible": true,
                "color": "#f9b222",
                "text": "Finance",
                "icon": "finance"
            },
            "slice-04": {
                "visible": true,
                "color": "#531f5a",
                "text": "Service Desk",
                "icon": "itservicedesk"
            },
            "slice-05": {
                "visible": true,
                "color": "#2485c2",
                "text": "IT Services",
                "icon": "itservices"
            }
        }
    }

    const savedConfig = localStorage.getItem('fortune-wheel-config');
    if (savedConfig) {
        if (confirm('Saved wheel configuration found. Do you want to use it?')) {
            config = JSON.parse(savedConfig);
        }
    }

    config.slices = [];
    Object.keys(config.visuals).filter(x => x.startsWith('slice-')).forEach(key => {
        config.slices.push(config.visuals[key]);
    });

    return config;
})();
