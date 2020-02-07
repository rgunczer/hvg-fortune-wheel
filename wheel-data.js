const wheelData = {
    "flashing": {
        "color": "#ffff00",
        "time": 100
    },
    "speed": {
        min: 30,
        max: 70
    },
    visuals: {
        "collisionCircles": {
            visible: false
        },
        "dividers": {
            visible: true,
            "color": "#004080",
            "size": "7",
            shadow: {
                color: '#000000',
                blur: 20,
                offsetx: 0,
                offsety: 0,
            }
        },
        "rods-main": {
            visible: true,
            color: '#ADD8E6',
            size: 1,
            shadow: {
                color: '#000000',
                blur: 14,
                offsetx: 0,
                offsety: 0
            }
        },
        "rods-sub": {
            visible: true,
            color: '#ADD8E6',
            size: 1,
            shadow: {
                color: '#000000',
                blur: 14,
                offsetx: 0,
                offsety: 0
            }
        },
        "texts": {
            visible: true,
            "color": "#c7c4ee",
            "size": "30",
            "offset": "438",
            shadow: {
                color: '#000000',
                blur: 10,
                offsetx: 0,
                offsety: 0,
            },
        },
        "slicesimages": {
            visible: true,
            "size": "16",
            "offset": "15",
            shadow: {
                color: '#000000',
                blur: 30,
                offsetx: 0,
                offsety: 0,
            }
        },
        "center": {
            visible: true,
            "color": "#7d7dff",
            "size": "28",
            shadow: {
                color: '#000000',
                blur: 20,
                offsetx: 0,
                offsety: 2
            }
        },
        "centerLogo": {
            visible: true,
            "size": 16,
            shadow: {
                color: '#000000',
                blur: 2,
                offsetx: 0,
                offsety: 2
            }
        },
        "innerRing": {
            visible: true,
            "color": "#7054b8",
            "size": "28",
            shadow: {
                color: '#000000',
                blur: 20,
                offsetx: 0,
                offsety: 0,
            }
        },
        "outerRing": {
            visible: true,
            "color": "#5a349a",
            "size": 30,
            shadow: {
                color: '#000000',
                blur: 20,
                offsetx: 0,
                offsety: 0,
            }
        },
        "tongue": {
            visible: true,
            outline: {
                color: '#ADD8E6',
            },
            middle: {
                color: '#c0c0c0'
            },
            shadow: {
                color: '#000000',
                blur: 15,
                offsetx: 0,
                offsety: 0,
            }
        },
        "slice-00": {
            visible: true,
            "color": "#918bc5",
            "text": "Life",
            "icon": "life"
        },
        "slice-01": {
            visible: true,
            "color": "#7557cc",
            "text": "Internship",
            "icon": "internship"
        },
        "slice-02": {
            visible: true,
            "color": "#a06bd1",
            "text": "Corporate",
            "icon": "corporate"
        },
        "slice-03": {
            visible: true,
            "color": "#73719d",
            "text": "Finance",
            "icon": "finance"
        },
        "slice-04": {
            visible: true,
            "color": "#4f59b9",
            "text": "Service Desk",
            "icon": "itservicedesk"
        },
        "slice-05": {
            visible: true,
            "color": "#6872b0",
            "text": "IT Services",
            "icon": "itservices"
        },
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
