// Static UI template; materialized with DOM APIs (no HTML injection sinks).
const AURORA_PANEL_TEMPLATE = [
  {
    "tag": "style",
    "attrs": {},
    "children": [
      "\n:host{font-family:-apple-system,BlinkMacSystemFont,\"PingFang SC\",sans-serif;color:#e6f5f0;font-size:13px;color-scheme:dark;line-height:1.45}\n*{box-sizing:border-box}button,input,select{font:inherit}button,select{cursor:pointer}button{color:inherit}\n.toggle{position:absolute;right:18px;top:82px;pointer-events:auto;border:1px solid #72e8cd55;background:#10251eeb;color:#befbe8;border-radius:20px;padding:8px 13px;box-shadow:0 4px 18px #0005;font-size:12px;}\n.panel{position:absolute;right:18px;top:126px;bottom:24px;width:min(346px,calc(100vw - 36px));max-height:760px;background:#0b171fed;border:1px solid #aecfc126;border-radius:20px;box-shadow:0 20px 60px #0007;backdrop-filter:blur(24px);pointer-events:auto;display:flex;flex-direction:column;overflow:hidden}\n[hidden]{display:none!important}header{padding:20px 22px 14px;border-bottom:1px solid #ffffff12}.eyebrow{color:#72dcc0;font-size:10px;letter-spacing:3px}h2{font-size:21px;font-weight:550;letter-spacing:1px;margin:5px 0}header p{color:#8199a7;font-size:11px;margin:0}.close{float:right;border:0;background:none;font-size:23px;color:#99b3c0;padding:0 2px}.content{padding:16px 22px;overflow-y:auto;scrollbar-width:thin}.presets{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:18px}button.preset,footer button,.actions button{border:1px solid #ffffff19;background:#ffffff06;border-radius:8px;padding:8px;font-size:12px}button:hover{background:#63e5be22;border-color:#63e5be88}button:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid #80e9ce;outline-offset:3px}\nh3{font-weight:500;color:#809aa8;font-size:11px;letter-spacing:2px;margin:20px 0 12px}.row{margin-bottom:15px}.rowline{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:7px}.value{display:flex;align-items:center;color:#6be6c6;font-size:11px;gap:3px}.num{width:57px;color:#8feace;background:#ffffff06;border:1px solid transparent;border-radius:4px;text-align:right;font-variant-numeric:tabular-nums;padding:3px;appearance:textfield}.num::-webkit-inner-spin-button{appearance:none}input[type=range]{display:block;width:100%;height:4px;margin:8px 0 2px;accent-color:#71dfc2;cursor:pointer}select{background:#17302f;border:1px solid #78dcb344;color:#c1eee0;padding:7px;border-radius:7px}input[type=checkbox]{accent-color:#70e0bf}.actions{display:flex;gap:8px;margin-top:14px}.actions>*{flex:1}summary{cursor:pointer;color:#9db4c0;font-size:12px;margin:20px 0 15px}.status{color:#7998a5;font-size:11px;margin-top:12px;min-height:16px}.error{color:#f4b9a0}footer{padding:13px 22px;border-top:1px solid #ffffff12;display:flex;align-items:center;justify-content:space-between;gap:12px;font-size:10px;color:#688391}footer a{color:#7fa89e;text-decoration:none}.import{display:none}\n"
    ]
  },
  {
    "tag": "button",
    "attrs": {
      "class": "toggle",
      "aria-expanded": "false",
      "aria-label": "打开极光壁纸设置"
    },
    "children": [
      "✦ 极光"
    ]
  },
  "\n",
  {
    "tag": "section",
    "attrs": {
      "class": "panel",
      "hidden": "",
      "aria-label": "极光壁纸设置"
    },
    "children": [
      {
        "tag": "header",
        "attrs": {},
        "children": [
          {
            "tag": "button",
            "attrs": {
              "class": "close",
              "aria-label": "关闭设置"
            },
            "children": [
              "×"
            ]
          },
          {
            "tag": "div",
            "attrs": {
              "class": "eyebrow"
            },
            "children": [
              "AURORA / LIVE WALLPAPER"
            ]
          },
          {
            "tag": "h2",
            "attrs": {},
            "children": [
              "极光电离层"
            ]
          },
          {
            "tag": "p",
            "attrs": {},
            "children": [
              "实时渲染 · 所有调整自动保存"
            ]
          }
        ]
      },
      {
        "tag": "div",
        "attrs": {
          "class": "content"
        },
        "children": [
          "\n",
          {
            "tag": "div",
            "attrs": {
              "class": "presets"
            },
            "children": []
          },
          {
            "tag": "div",
            "attrs": {
              "class": "rowline"
            },
            "children": [
              {
                "tag": "label",
                "attrs": {
                  "for": "enabled"
                },
                "children": [
                  "动态壁纸"
                ]
              },
              {
                "tag": "input",
                "attrs": {
                  "id": "enabled",
                  "type": "checkbox"
                },
                "children": []
              }
            ]
          },
          "\n",
          {
            "tag": "h3",
            "attrs": {},
            "children": [
              "渲染与播放"
            ]
          },
          {
            "tag": "div",
            "attrs": {
              "class": "rowline"
            },
            "children": [
              {
                "tag": "label",
                "attrs": {
                  "for": "quality"
                },
                "children": [
                  "渲染质量"
                ]
              },
              {
                "tag": "select",
                "attrs": {
                  "id": "quality"
                },
                "children": [
                  {
                    "tag": "option",
                    "attrs": {
                      "value": "low"
                    },
                    "children": [
                      "轻量 · 32 层"
                    ]
                  },
                  {
                    "tag": "option",
                    "attrs": {
                      "value": "medium"
                    },
                    "children": [
                      "均衡 · 50 层"
                    ]
                  },
                  {
                    "tag": "option",
                    "attrs": {
                      "value": "high"
                    },
                    "children": [
                      "精细 · 72 层"
                    ]
                  }
                ]
              }
            ]
          },
          "\n",
          {
            "tag": "div",
            "attrs": {
              "class": "actions"
            },
            "children": [
              {
                "tag": "button",
                "attrs": {
                  "id": "pause"
                },
                "children": [
                  "暂停"
                ]
              },
              {
                "tag": "button",
                "attrs": {
                  "id": "replay"
                },
                "children": [
                  "重播开场"
                ]
              }
            ]
          },
          "\n",
          {
            "tag": "h3",
            "attrs": {},
            "children": [
              "光幕与色彩"
            ]
          },
          {
            "tag": "div",
            "attrs": {
              "id": "field"
            },
            "children": []
          },
          {
            "tag": "h3",
            "attrs": {},
            "children": [
              "阅读舒适度"
            ]
          },
          {
            "tag": "div",
            "attrs": {
              "id": "reading"
            },
            "children": []
          },
          {
            "tag": "details",
            "attrs": {},
            "children": [
              {
                "tag": "summary",
                "attrs": {},
                "children": [
                  "开场动画参数"
                ]
              },
              {
                "tag": "div",
                "attrs": {
                  "id": "intro"
                },
                "children": []
              }
            ]
          },
          "\n",
          {
            "tag": "div",
            "attrs": {
              "class": "actions"
            },
            "children": [
              {
                "tag": "button",
                "attrs": {
                  "id": "export"
                },
                "children": [
                  "导出参数"
                ]
              },
              {
                "tag": "button",
                "attrs": {
                  "id": "import"
                },
                "children": [
                  "导入参数"
                ]
              }
            ]
          },
          {
            "tag": "input",
            "attrs": {
              "class": "import",
              "type": "file",
              "accept": "application/json,.json"
            },
            "children": []
          },
          {
            "tag": "div",
            "attrs": {
              "class": "status",
              "role": "status"
            },
            "children": [
              "本地渲染 · 最高 30 FPS · 隐藏时暂停"
            ]
          },
          "\n"
        ]
      },
      {
        "tag": "footer",
        "attrs": {},
        "children": [
          {
            "tag": "span",
            "attrs": {},
            "children": [
              {
                "tag": "a",
                "attrs": {
                  "href": "https://www.shadertoy.com/view/XtGGRt",
                  "target": "_blank",
                  "rel": "noreferrer"
                },
                "children": [
                  "Auroras / nimitz"
                ]
              }
            ]
          },
          {
            "tag": "button",
            "attrs": {
              "id": "reset"
            },
            "children": [
              "恢复默认参数"
            ]
          }
        ]
      }
    ]
  }
];
