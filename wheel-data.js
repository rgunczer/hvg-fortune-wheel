const wheelData = {
    "flashing-color": "#ffff00",
    "flashing-time": 100,
    "speed-min": 30,
    "speed-max": 70,
    "shadow-range-min": -50,
    "shadow-range-max": 50,
    visuals: {
        "collision-circles": {
            "visible": false
        },
        "dividers": {
            "visible": true,
            "color": "#ffffff",
            "scale": 0,
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
                "blur": 14,
                "offsetx": 5,
                "offsety": 5
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
            "visible": true,
            "color": "#ffffff",
            "scale": "40",
            "offset": 417,
            "offset-max": 600,
            "font-face": "PT Sans Narrow",
            "shadow": {
                "color": "#000000",
                "blur": "20",
                "offsetx": "4",
                "offsety": "0"
            },
            "stroke": {
                "visible": false,
                "color": "#e8e8e8",
                "width": "0"
            }
        },
        "slicesimages": {
            "visible": true,
            "scale": "25",
            "offset": "38",
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
            "scale": 12,
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
            "color": "#5a349a",
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
            "color": "#663aad",
            "scale": 10,
            "shadow": {
                "color": "#000000",
                "blur": "20",
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

    },
    slices: []
};

// apply TCS colors
wheelData.visuals['slice-00'].color = rgbObjToHex(TCSColors.DarkRed);
wheelData.visuals['slice-01'].color = rgbObjToHex(TCSColors.LightPurple);
wheelData.visuals['slice-02'].color = rgbObjToHex(TCSColors.MediumPurple);
wheelData.visuals['slice-03'].color = rgbObjToHex(TCSColors.DarkOrange);
wheelData.visuals['slice-04'].color = rgbObjToHex(TCSColors.DarkPurple);
wheelData.visuals['slice-05'].color = rgbObjToHex(TCSColors.DarkBlue);

wheelData.slices.length = 0;
Object.keys(wheelData.visuals).filter(x => x.startsWith('slice-')).forEach(key => {
    wheelData.slices.push(wheelData.visuals[key]);
});
