var testFixture;

var fbTestFixture = {
    'XJS': {
        '<a />': {
            type: "ExpressionStatement",
            expression: {
                type: "XJSElement",
                openingElement: {
                  type: "XJSOpeningElement",
                  name: {
                      type: "XJSIdentifier",
                      name: "a",
                      range: [1, 2],
                      loc: {
                          start: { line: 1, column: 1 },
                          end: { line: 1, column: 2 }
                      }
                  },
                  selfClosing: true,
                  attributes: [],
                  range: [0, 5],
                  loc: {
                      start: { line: 1, column: 0 },
                      end: { line: 1, column: 5 }
                  }
                },
                children: [],
                range: [0, 5],
                loc: {
                    start: { line: 1, column: 0 },
                    end: { line: 1, column: 5 }
                }
            },
            range: [0, 5],
            loc: {
                start: { line: 1, column: 0 },
                end: { line: 1, column: 5 }
            }
        },
        '<n:a n:v />': {
            type: "ExpressionStatement",
            expression: {
                type: "XJSElement",
                openingElement: {
                  type: "XJSOpeningElement",
                  name: {
                      type: "XJSIdentifier",
                      name: "a",
                      namespace: "n",
                      range: [1, 4],
                      loc: {
                          start: { line: 1, column: 1 },
                          end: { line: 1, column: 4 }
                      }
                  },
                  selfClosing: true,
                  attributes: [
                      {
                          type: "XJSAttribute",
                          name: {
                              type: "XJSIdentifier",
                              name: "v",
                              namespace: "n",
                              range: [5, 8],
                              loc: {
                                  start: { line: 1, column: 5 },
                                  end: { line: 1, column: 8 }
                              }
                          },
                          range: [5, 8],
                          loc: {
                              start: { line: 1, column: 5 },
                              end: { line: 1, column: 8 }
                          }
                      }
                  ],
                  range: [0, 11],
                  loc: {
                      start: { line: 1, column: 0 },
                      end: { line: 1, column: 11 }
                  }
                },
                children: [],
                range: [0, 11],
                loc: {
                    start: { line: 1, column: 0 },
                    end: { line: 1, column: 11 }
                }
            },
            range: [0, 11],
            loc: {
                start: { line: 1, column: 0 },
                end: { line: 1, column: 11 }
            }
        },
        '<a n:foo="bar"> {value} <b><c /></b></a>': {
            type: "ExpressionStatement",
            expression: {
                type: "XJSElement",
                openingElement: {
                    type: "XJSOpeningElement",
                    name: {
                        type: "XJSIdentifier",
                        name: "a",
                        range: [1, 2],
                        loc: {
                            start: { line: 1, column: 1 },
                            end: { line: 1, column: 2 }
                        }
                    },
                    selfClosing: false,
                    attributes: [
                        {
                            type: "XJSAttribute",
                            name: {
                                type: "XJSIdentifier",
                                name: "foo",
                                namespace: "n",
                                range: [3, 8],
                                loc: {
                                    start: { line: 1, column: 3 },
                                    end: { line: 1, column: 8 }
                                }
                            },
                            value: {
                                type: "Literal",
                                value: "bar",
                                raw: "\"bar\"",
                                range: [9, 14],
                                loc: {
                                    start: { line: 1, column: 9 },
                                    end: { line: 1, column: 14 }
                                }
                            },
                            range: [3, 14],
                            loc: {
                                start: { line: 1, column: 3 },
                                end: { line: 1, column: 14 }
                            }
                        }
                    ],
                    range: [0, 15],
                    loc: {
                        start: { line: 1, column: 0 },
                        end: { line: 1, column: 15 }
                    }
                },
                closingElement: {
                    type: "XJSClosingElement",
                    name: {
                        type: "XJSIdentifier",
                        name: "a",
                        range: [38, 39],
                        loc: {
                            start: { line: 1, column: 38 },
                            end: { line: 1, column: 39 }
                        }
                    },
                    range: [36, 40],
                    loc: {
                        start: { line: 1, column: 36 },
                        end: { line: 1, column: 40 }
                    }
                },
                children: [
                    {
                        type: "Literal",
                        value: " ",
                        raw: " ",
                        range: [15, 16],
                        loc: {
                            start: { line: 1, column: 15 },
                            end: { line: 1, column: 16 }
                        }
                    },
                    {
                        type: "XJSExpressionContainer",
                        expression: {
                            type: "Identifier",
                            name: "value",
                            range: [17, 22],
                            loc: {
                                start: { line: 1, column: 17 },
                                end: { line: 1, column: 22 }
                            }
                        },
                        range: [16, 23],
                        loc: {
                            start: { line: 1, column: 16 },
                            end: { line: 1, column: 23 }
                        }
                    },
                    {
                        type: "Literal",
                        value: " ",
                        raw: " ",
                        range: [23, 24],
                        loc: {
                            start: { line: 1, column: 23 },
                            end: { line: 1, column: 24 }
                        }
                    },
                    {
                        type: "XJSElement",
                        openingElement: {
                            type: "XJSOpeningElement",
                            name: {
                                type: "XJSIdentifier",
                                name: "b",
                                range: [25, 26],
                                loc: {
                                    start: { line: 1, column: 25 },
                                    end: { line: 1, column: 26 }
                                }
                            },
                            selfClosing: false,
                            attributes: [],
                            range: [24, 27],
                            loc: {
                                start: { line: 1, column: 24 },
                                end: { line: 1, column: 27 }
                            }
                        },
                        closingElement: {
                            type: "XJSClosingElement",
                            name: {
                                type: "XJSIdentifier",
                                name: "b",
                                range: [34, 35],
                                loc: {
                                    start: { line: 1, column: 34 },
                                    end: { line: 1, column: 35 }
                                }
                            },
                            range: [32, 36],
                            loc: {
                                start: { line: 1, column: 32 },
                                end: { line: 1, column: 36 }
                            }
                        },
                        children: [
                            {
                                type: "XJSElement",
                                openingElement: {
                                    type: "XJSOpeningElement",
                                    name: {
                                        type: "XJSIdentifier",
                                        name: "c",
                                        range: [28, 29],
                                        loc: {
                                            start: { line: 1, column: 28 },
                                            end: { line: 1, column: 29 }
                                        }
                                    },
                                    selfClosing: true,
                                    attributes: [],
                                    range: [27, 32],
                                    loc: {
                                        start: { line: 1, column: 27 },
                                        end: { line: 1, column: 32 }
                                    }
                                },
                                children: [],
                                range: [27, 32],
                                loc: {
                                    start: { line: 1, column: 27 },
                                    end: { line: 1, column: 32 }
                                }
                            }
                        ],
                        range: [24, 36],
                        loc: {
                            start: { line: 1, column: 24 },
                            end: { line: 1, column: 36 }
                        }
                    }
                ],
                range: [0, 40],
                loc: {
                    start: { line: 1, column: 0 },
                    end: { line: 1, column: 40 }
                }
            },
            range: [0, 40],
            loc: {
                start: { line: 1, column: 0 },
                end: { line: 1, column: 40 }
            }
        },
        '<a b={" "} c=" " d="&amp;" />': {
            type: "ExpressionStatement",
            expression: {
                type: "XJSElement",
                openingElement: {
                    type: "XJSOpeningElement",
                    name: {
                        type: "XJSIdentifier",
                        name: "a",
                        range: [1, 2],
                        loc: {
                            start: { line: 1, column: 1 },
                            end: { line: 1, column: 2 }
                        }
                    },
                    selfClosing: true,
                    attributes: [
                        {
                            type: "XJSAttribute",
                            name: {
                                type: "XJSIdentifier",
                                name: "b",
                                range: [3, 4],
                                loc: {
                                    start: { line: 1, column: 3 },
                                    end: { line: 1, column: 4 }
                                }
                            },
                            value: {
                                type: "XJSExpressionContainer",
                                expression: {
                                    type: "Literal",
                                    value: " ",
                                    raw: "\" \"",
                                    range: [6, 9],
                                    loc: {
                                        start: { line: 1, column: 6 },
                                        end: { line: 1, column: 9 }
                                    }
                                },
                                range: [5, 10],
                                loc: {
                                    start: { line: 1, column: 5 },
                                    end: { line: 1, column: 10 }
                                }
                            },
                            range: [3, 10],
                            loc: {
                                start: { line: 1, column: 3 },
                                end: { line: 1, column: 10 }
                            }
                        },
                        {
                            type: "XJSAttribute",
                            name: {
                                type: "XJSIdentifier",
                                name: "c",
                                range: [11, 12],
                                loc: {
                                    start: { line: 1, column: 11 },
                                    end: { line: 1, column: 12 }
                                }
                            },
                            value: {
                                type: "Literal",
                                value: " ",
                                raw: "\" \"",
                                range: [13, 16],
                                loc: {
                                    start: { line: 1, column: 13 },
                                    end: { line: 1, column: 16 }
                                }
                            },
                            range: [11, 16],
                            loc: {
                                start: { line: 1, column: 11 },
                                end: { line: 1, column: 16 }
                            }
                        },
                        {
                            type: "XJSAttribute",
                            name: {
                                type: "XJSIdentifier",
                                name: "d",
                                range: [17, 18],
                                loc: {
                                    start: { line: 1, column: 17 },
                                    end: { line: 1, column: 18 }
                                }
                            },
                            value: {
                                type: "Literal",
                                value: "&",
                                raw: "\"&amp;\"",
                                range: [19, 26],
                                loc: {
                                    start: { line: 1, column: 19 },
                                    end: { line: 1, column: 26 }
                                }
                            },
                            range: [17, 26],
                            loc: {
                                start: { line: 1, column: 17 },
                                end: { line: 1, column: 26 }
                            }
                        }
                    ],
                    range: [0, 29],
                    loc: {
                        start: { line: 1, column: 0 },
                        end: { line: 1, column: 29 }
                    }
                },
                children: [],
                range: [0, 29],
                loc: {
                    start: { line: 1, column: 0 },
                    end: { line: 1, column: 29 }
                }
            },
            range: [0, 29],
            loc: {
                start: { line: 1, column: 0 },
                end: { line: 1, column: 29 }
            }
        },
        '<a\n/>': {
            type: "ExpressionStatement",
            expression: {
                type: "XJSElement",
                openingElement: {
                    type: "XJSOpeningElement",
                    name: {
                        type: "XJSIdentifier",
                        name: "a",
                        range: [
                            1,
                            2
                        ],
                        loc: {
                            start: {
                                line: 1,
                                column: 1
                            },
                            end: {
                                line: 1,
                                column: 2
                            }
                        }
                    },
                    selfClosing: true,
                    attributes: [],
                    range: [
                        0,
                        5
                    ],
                    loc: {
                        start: {
                            line: 1,
                            column: 0
                        },
                        end: {
                            line: 2,
                            column: 2
                        }
                    }
                },
                children: [],
                range: [
                    0,
                    5
                ],
                loc: {
                    start: {
                        line: 1,
                        column: 0
                    },
                    end: {
                        line: 2,
                        column: 2
                    }
                }
            },
            range: [
                0,
                5
            ],
            loc: {
                start: {
                    line: 1,
                    column: 0
                },
                end: {
                    line: 2,
                    column: 2
                }
            }
        },
        '<日本語></日本語>': {
            type: "ExpressionStatement",
            expression: {
                type: "XJSElement",
                openingElement: {
                    type: "XJSOpeningElement",
                    name: {
                        type: "XJSIdentifier",
                        name: "日本語",
                        range: [
                            1,
                            4
                        ],
                        loc: {
                            start: {
                                line: 1,
                                column: 1
                            },
                            end: {
                                line: 1,
                                column: 4
                            }
                        }
                    },
                    selfClosing: false,
                    attributes: [],
                    range: [
                        0,
                        5
                    ],
                    loc: {
                        start: {
                            line: 1,
                            column: 0
                        },
                        end: {
                            line: 1,
                            column: 5
                        }
                    }
                },
                closingElement: {
                    type: "XJSClosingElement",
                    name: {
                        type: "XJSIdentifier",
                        name: "日本語",
                        range: [
                            7,
                            10
                        ],
                        loc: {
                            start: {
                                line: 1,
                                column: 7
                            },
                            end: {
                                line: 1,
                                column: 10
                            }
                        }
                    },
                    range: [
                        5,
                        11
                    ],
                    loc: {
                        start: {
                            line: 1,
                            column: 5
                        },
                        end: {
                            line: 1,
                            column: 11
                        }
                    }
                },
                children: [],
                range: [
                    0,
                    11
                ],
                loc: {
                    start: {
                        line: 1,
                        column: 0
                    },
                    end: {
                        line: 1,
                        column: 11
                    }
                }
            },
            range: [
                0,
                11
            ],
            loc: {
                start: {
                    line: 1,
                    column: 0
                },
                end: {
                    line: 1,
                    column: 11
                }
            }
        },

        '<AbC-def\n  test="&#x0026;&#38;">\nbar\nbaz\n</AbC-def>': {
            type: "ExpressionStatement",
            expression: {
                type: "XJSElement",
                openingElement: {
                    type: "XJSOpeningElement",
                    name: {
                        type: "XJSIdentifier",
                        name: "AbC-def",
                        range: [
                            1,
                            8
                        ],
                        loc: {
                            start: {
                                line: 1,
                                column: 1
                            },
                            end: {
                                line: 1,
                                column: 8
                            }
                        }
                    },
                    selfClosing: false,
                    attributes: [
                        {
                            type: "XJSAttribute",
                            name: {
                                type: "XJSIdentifier",
                                name: "test",
                                range: [
                                    11,
                                    15
                                ],
                                loc: {
                                    start: {
                                        line: 2,
                                        column: 2
                                    },
                                    end: {
                                        line: 2,
                                        column: 6
                                    }
                                }
                            },
                            value: {
                                type: "Literal",
                                value: "&&",
                                raw: "\"&#x0026;&#38;\"",
                                range: [
                                    16,
                                    31
                                ],
                                loc: {
                                    start: {
                                        line: 2,
                                        column: 7
                                    },
                                    end: {
                                        line: 2,
                                        column: 22
                                    }
                                }
                            },
                            range: [
                                11,
                                31
                            ],
                            loc: {
                                start: {
                                    line: 2,
                                    column: 2
                                },
                                end: {
                                    line: 2,
                                    column: 22
                                }
                            }
                        }
                    ],
                    range: [
                        0,
                        32
                    ],
                    loc: {
                        start: {
                            line: 1,
                            column: 0
                        },
                        end: {
                            line: 2,
                            column: 23
                        }
                    }
                },
                closingElement: {
                    type: "XJSClosingElement",
                    name: {
                        type: "XJSIdentifier",
                        name: "AbC-def",
                        range: [
                            43,
                            50
                        ],
                        loc: {
                            start: {
                                line: 5,
                                column: 2
                            },
                            end: {
                                line: 5,
                                column: 9
                            }
                        }
                    },
                    range: [
                        41,
                        51
                    ],
                    loc: {
                        start: {
                            line: 5,
                            column: 0
                        },
                        end: {
                            line: 5,
                            column: 10
                        }
                    }
                },
                children: [
                    {
                        type: "Literal",
                        value: "\nbar\nbaz\n",
                        raw: "\nbar\nbaz\n",
                        range: [
                            32,
                            41
                        ],
                        loc: {
                            start: {
                                line: 2,
                                column: 23
                            },
                            end: {
                                line: 5,
                                column: 0
                            }
                        }
                    }
                ],
                range: [
                    0,
                    51
                ],
                loc: {
                    start: {
                        line: 1,
                        column: 0
                    },
                    end: {
                        line: 5,
                        column: 10
                    }
                }
            },
            range: [
                0,
                51
            ],
            loc: {
                start: {
                    line: 1,
                    column: 0
                },
                end: {
                    line: 5,
                    column: 10
                }
            }
        },

        '<a b={x ? <c /> : <d />} />': {
            type: "ExpressionStatement",
            expression: {
                type: "XJSElement",
                openingElement: {
                    type: "XJSOpeningElement",
                    name: {
                        type: "XJSIdentifier",
                        name: "a",
                        range: [
                            1,
                            2
                        ],
                        loc: {
                            start: {
                                line: 1,
                                column: 1
                            },
                            end: {
                                line: 1,
                                column: 2
                            }
                        }
                    },
                    selfClosing: true,
                    attributes: [
                        {
                            type: "XJSAttribute",
                            name: {
                                type: "XJSIdentifier",
                                name: "b",
                                range: [
                                    3,
                                    4
                                ],
                                loc: {
                                    start: {
                                        line: 1,
                                        column: 3
                                    },
                                    end: {
                                        line: 1,
                                        column: 4
                                    }
                                }
                            },
                            value: {
                                type: "XJSExpressionContainer",
                                expression: {
                                    type: "ConditionalExpression",
                                    test: {
                                        type: "Identifier",
                                        name: "x",
                                        range: [
                                            6,
                                            7
                                        ],
                                        loc: {
                                            start: {
                                                line: 1,
                                                column: 6
                                            },
                                            end: {
                                                line: 1,
                                                column: 7
                                            }
                                        }
                                    },
                                    consequent: {
                                        type: "XJSElement",
                                        openingElement: {
                                            type: "XJSOpeningElement",
                                            name: {
                                                type: "XJSIdentifier",
                                                name: "c",
                                                range: [
                                                    11,
                                                    12
                                                ],
                                                loc: {
                                                    start: {
                                                        line: 1,
                                                        column: 11
                                                    },
                                                    end: {
                                                        line: 1,
                                                        column: 12
                                                    }
                                                }
                                            },
                                            selfClosing: true,
                                            attributes: [],
                                            range: [
                                                10,
                                                15
                                            ],
                                            loc: {
                                                start: {
                                                    line: 1,
                                                    column: 10
                                                },
                                                end: {
                                                    line: 1,
                                                    column: 15
                                                }
                                            }
                                        },
                                        children: [],
                                        range: [
                                            10,
                                            15
                                        ],
                                        loc: {
                                            start: {
                                                line: 1,
                                                column: 10
                                            },
                                            end: {
                                                line: 1,
                                                column: 15
                                            }
                                        }
                                    },
                                    alternate: {
                                        type: "XJSElement",
                                        openingElement: {
                                            type: "XJSOpeningElement",
                                            name: {
                                                type: "XJSIdentifier",
                                                name: "d",
                                                range: [
                                                    19,
                                                    20
                                                ],
                                                loc: {
                                                    start: {
                                                        line: 1,
                                                        column: 19
                                                    },
                                                    end: {
                                                        line: 1,
                                                        column: 20
                                                    }
                                                }
                                            },
                                            selfClosing: true,
                                            attributes: [],
                                            range: [
                                                18,
                                                23
                                            ],
                                            loc: {
                                                start: {
                                                    line: 1,
                                                    column: 18
                                                },
                                                end: {
                                                    line: 1,
                                                    column: 23
                                                }
                                            }
                                        },
                                        children: [],
                                        range: [
                                            18,
                                            23
                                        ],
                                        loc: {
                                            start: {
                                                line: 1,
                                                column: 18
                                            },
                                            end: {
                                                line: 1,
                                                column: 23
                                            }
                                        }
                                    },
                                    range: [
                                        6,
                                        23
                                    ],
                                    loc: {
                                        start: {
                                            line: 1,
                                            column: 6
                                        },
                                        end: {
                                            line: 1,
                                            column: 23
                                        }
                                    }
                                },
                                range: [
                                    5,
                                    24
                                ],
                                loc: {
                                    start: {
                                        line: 1,
                                        column: 5
                                    },
                                    end: {
                                        line: 1,
                                        column: 24
                                    }
                                }
                            },
                            range: [
                                3,
                                24
                            ],
                            loc: {
                                start: {
                                    line: 1,
                                    column: 3
                                },
                                end: {
                                    line: 1,
                                    column: 24
                                }
                            }
                        }
                    ],
                    range: [
                        0,
                        27
                    ],
                    loc: {
                        start: {
                            line: 1,
                            column: 0
                        },
                        end: {
                            line: 1,
                            column: 27
                        }
                    }
                },
                children: [],
                range: [
                    0,
                    27
                ],
                loc: {
                    start: {
                        line: 1,
                        column: 0
                    },
                    end: {
                        line: 1,
                        column: 27
                    }
                }
            },
            range: [
                0,
                27
            ],
            loc: {
                start: {
                    line: 1,
                    column: 0
                },
                end: {
                    line: 1,
                    column: 27
                }
            }
        },

        '<a>{}</a>': {
            type: 'ExpressionStatement',
            expression: {
                type: 'XJSElement',
                openingElement: {
                    type: 'XJSOpeningElement',
                    name: {
                        type: 'XJSIdentifier',
                        name: 'a',
                        range: [1, 2],
                        loc: {
                            start: { line: 1, column: 1 },
                            end: { line: 1, column: 2 }
                        }
                    },
                    selfClosing: false,
                    attributes: [],
                    range: [0, 3],
                    loc: {
                        start: { line: 1, column: 0 },
                        end: { line: 1, column: 3 }
                    }
                },
                closingElement: {
                    type: 'XJSClosingElement',
                    name: {
                        type: 'XJSIdentifier',
                        name: 'a',
                        range: [7, 8],
                        loc: {
                            start: { line: 1, column: 7 },
                            end: { line: 1, column: 8 }
                        }
                    },
                    range: [5, 9],
                    loc: {
                        start: { line: 1, column: 5 },
                        end: { line: 1, column: 9 }
                    }
                },
                children: [{
                    type: 'XJSExpressionContainer',
                    expression: {
                        type: 'XJSEmptyExpression',
                        range: [4, 4],
                        loc: {
                            start: { line: 1, column: 4 },
                            end: { line: 1, column: 4 }
                        }
                    },
                    range: [3, 5],
                    loc: {
                        start: { line: 1, column: 3 },
                        end: { line: 1, column: 5 }
                    }
                }],
                range: [0, 9],
                loc: {
                    start: { line: 1, column: 0 },
                    end: { line: 1, column: 9 }
                }
            },
            range: [0, 9],
            loc: {
                start: { line: 1, column: 0 },
                end: { line: 1, column: 9 }
            }
        },

        '<a>{/* this is a comment */}</a>': {
            type: 'ExpressionStatement',
            expression: {
                type: 'XJSElement',
                openingElement: {
                    type: 'XJSOpeningElement',
                    name: {
                        type: 'XJSIdentifier',
                        name: 'a',
                        range: [1, 2],
                        loc: {
                            start: { line: 1, column: 1 },
                            end: { line: 1, column: 2 }
                        }
                    },
                    selfClosing: false,
                    attributes: [],
                    range: [0, 3],
                    loc: {
                        start: { line: 1, column: 0 },
                        end: { line: 1, column: 3 }
                    }
                },
                closingElement: {
                    type: 'XJSClosingElement',
                    name: {
                        type: 'XJSIdentifier',
                        name: 'a',
                        range: [30, 31],
                        loc: {
                            start: { line: 1, column: 30 },
                            end: { line: 1, column: 31 }
                        }
                    },
                    range: [28, 32],
                    loc: {
                        start: { line: 1, column: 28 },
                        end: { line: 1, column: 32 }
                    }
                },
                children: [{
                    type: 'XJSExpressionContainer',
                    expression: {
                        type: 'XJSEmptyExpression',
                        range: [4, 27],
                        loc: {
                            start: { line: 1, column: 4 },
                            end: { line: 1, column: 27 }
                        }
                    },
                    range: [3, 28],
                    loc: {
                        start: { line: 1, column: 3 },
                        end: { line: 1, column: 28 }
                    }
                }],
                range: [0, 32],
                loc: {
                    start: { line: 1, column: 0 },
                    end: { line: 1, column: 32 }
                }
            },
            range: [0, 32],
            loc: {
                start: { line: 1, column: 0 },
                end: { line: 1, column: 32 }
            }
        },

        '<div>@test content</div>': {
            type: 'ExpressionStatement',
            expression: {
                type: 'XJSElement',
                openingElement: {
                    type: 'XJSOpeningElement',
                    name: {
                        type: 'XJSIdentifier',
                        name: 'div',
                        range: [1, 4],
                        loc: {
                            start: { line: 1, column: 1 },
                            end: { line: 1, column: 4 }
                        }
                    },
                    selfClosing: false,
                    attributes: [],
                    range: [0, 5],
                    loc: {
                        start: { line: 1, column: 0 },
                        end: { line: 1, column: 5 }
                    }
                },
                closingElement: {
                    type: 'XJSClosingElement',
                    name: {
                        type: 'XJSIdentifier',
                        name: 'div',
                        range: [20, 23],
                        loc: {
                            start: { line: 1, column: 20 },
                            end: { line: 1, column: 23 }
                        }
                    },
                    range: [18, 24],
                    loc: {
                        start: { line: 1, column: 18 },
                        end: { line: 1, column: 24 }
                    }
                },
                children: [{
                    type: 'Literal',
                    value: '@test content',
                    raw: '@test content',
                    range: [5, 18],
                    loc: {
                        start: { line: 1, column: 5 },
                        end: { line: 1, column: 18 }
                    }
                }],
                range: [0, 24],
                loc: {
                    start: { line: 1, column: 0 },
                    end: { line: 1, column: 24 }
                }
            },
            range: [0, 24],
            loc: {
                start: { line: 1, column: 0 },
                end: { line: 1, column: 24 }
            }
        },

        '<div><br />7x invalid-js-identifier</div>': {
            type: 'ExpressionStatement',
            expression: {
                type: 'XJSElement',
                openingElement: {
                    type: 'XJSOpeningElement',
                    name: {
                        type: 'XJSIdentifier',
                        name: 'div',
                        range: [
                            1,
                            4
                        ],
                        loc: {
                            start: {
                                line: 1,
                                column: 1
                            },
                            end: {
                                line: 1,
                                column: 4
                            }
                        }
                    },
                    selfClosing: false,
                    attributes: [],
                    range: [
                        0,
                        5
                    ],
                    loc: {
                        start: {
                            line: 1,
                            column: 0
                        },
                        end: {
                            line: 1,
                            column: 5
                        }
                    }
                },
                closingElement: {
                    type: 'XJSClosingElement',
                    name: {
                        type: 'XJSIdentifier',
                        name: 'div',
                        range: [
                            37,
                            40
                        ],
                        loc: {
                            start: {
                                line: 1,
                                column: 37
                            },
                            end: {
                                line: 1,
                                column: 40
                            }
                        }
                    },
                    range: [
                        35,
                        41
                    ],
                    loc: {
                        start: {
                            line: 1,
                            column: 35
                        },
                        end: {
                            line: 1,
                            column: 41
                        }
                    }
                },
                children: [{
                    type: 'XJSElement',
                    openingElement: {
                        type: 'XJSOpeningElement',
                        name: {
                            type: 'XJSIdentifier',
                            name: 'br',
                            range: [
                                6,
                                8
                            ],
                            loc: {
                                start: {
                                    line: 1,
                                    column: 6
                                },
                                end: {
                                    line: 1,
                                    column: 8
                                }
                            }
                        },
                        selfClosing: true,
                        attributes: [],
                        range: [
                            5,
                            11
                        ],
                        loc: {
                            start: {
                                line: 1,
                                column: 5
                            },
                            end: {
                                line: 1,
                                column: 11
                            }
                        }
                    },
                    children: [],
                    range: [
                        5,
                        11
                    ],
                    loc: {
                        start: {
                            line: 1,
                            column: 5
                        },
                        end: {
                            line: 1,
                            column: 11
                        }
                    }
                }, {
                    type: 'Literal',
                    value: '7x invalid-js-identifier',
                    raw: '7x invalid-js-identifier',
                    range: [
                        11,
                        35
                    ],
                    loc: {
                        start: {
                            line: 1,
                            column: 11
                        },
                        end: {
                            line: 1,
                            column: 35
                        }
                    }
                }],
                range: [
                    0,
                    41
                ],
                loc: {
                    start: {
                        line: 1,
                        column: 0
                    },
                    end: {
                        line: 1,
                        column: 41
                    }
                }
            },
            range: [
                0,
                41
            ],
            loc: {
                start: {
                    line: 1,
                    column: 0
                },
                end: {
                    line: 1,
                    column: 41
                }
            }
        },

        '<LeftRight left=<a /> right=<b>monkeys /> gorillas</b> />': {
            "type": "ExpressionStatement",
            "expression": {
                "type": "XJSElement",
                "openingElement": {
                    "type": "XJSOpeningElement",
                    "name": {
                        "type": "XJSIdentifier",
                        "name": "LeftRight",
                        "range": [
                            1,
                            10
                        ],
                        "loc": {
                            "start": {
                                "line": 1,
                                "column": 1
                            },
                            "end": {
                                "line": 1,
                                "column": 10
                            }
                        }
                    },
                    "selfClosing": true,
                    "attributes": [
                        {
                            "type": "XJSAttribute",
                            "name": {
                                "type": "XJSIdentifier",
                                "name": "left",
                                "range": [
                                    11,
                                    15
                                ],
                                "loc": {
                                    "start": {
                                        "line": 1,
                                        "column": 11
                                    },
                                    "end": {
                                        "line": 1,
                                        "column": 15
                                    }
                                }
                            },
                            "value": {
                                "type": "XJSElement",
                                "openingElement": {
                                    "type": "XJSOpeningElement",
                                    "name": {
                                        "type": "XJSIdentifier",
                                        "name": "a",
                                        "range": [
                                            17,
                                            18
                                        ],
                                        "loc": {
                                            "start": {
                                                "line": 1,
                                                "column": 17
                                            },
                                            "end": {
                                                "line": 1,
                                                "column": 18
                                            }
                                        }
                                    },
                                    "selfClosing": true,
                                    "attributes": [],
                                    "range": [
                                        16,
                                        21
                                    ],
                                    "loc": {
                                        "start": {
                                            "line": 1,
                                            "column": 16
                                        },
                                        "end": {
                                            "line": 1,
                                            "column": 21
                                        }
                                    }
                                },
                                "children": [],
                                "range": [
                                    16,
                                    21
                                ],
                                "loc": {
                                    "start": {
                                        "line": 1,
                                        "column": 16
                                    },
                                    "end": {
                                        "line": 1,
                                        "column": 21
                                    }
                                }
                            },
                            "range": [
                                11,
                                21
                            ],
                            "loc": {
                                "start": {
                                    "line": 1,
                                    "column": 11
                                },
                                "end": {
                                    "line": 1,
                                    "column": 21
                                }
                            }
                        },
                        {
                            "type": "XJSAttribute",
                            "name": {
                                "type": "XJSIdentifier",
                                "name": "right",
                                "range": [
                                    22,
                                    27
                                ],
                                "loc": {
                                    "start": {
                                        "line": 1,
                                        "column": 22
                                    },
                                    "end": {
                                        "line": 1,
                                        "column": 27
                                    }
                                }
                            },
                            "value": {
                                "type": "XJSElement",
                                "openingElement": {
                                    "type": "XJSOpeningElement",
                                    "name": {
                                        "type": "XJSIdentifier",
                                        "name": "b",
                                        "range": [
                                            29,
                                            30
                                        ],
                                        "loc": {
                                            "start": {
                                                "line": 1,
                                                "column": 29
                                            },
                                            "end": {
                                                "line": 1,
                                                "column": 30
                                            }
                                        }
                                    },
                                    "selfClosing": false,
                                    "attributes": [],
                                    "range": [
                                        28,
                                        31
                                    ],
                                    "loc": {
                                        "start": {
                                            "line": 1,
                                            "column": 28
                                        },
                                        "end": {
                                            "line": 1,
                                            "column": 31
                                        }
                                    }
                                },
                                "closingElement": {
                                    "type": "XJSClosingElement",
                                    "name": {
                                        "type": "XJSIdentifier",
                                        "name": "b",
                                        "range": [
                                            52,
                                            53
                                        ],
                                        "loc": {
                                            "start": {
                                                "line": 1,
                                                "column": 52
                                            },
                                            "end": {
                                                "line": 1,
                                                "column": 53
                                            }
                                        }
                                    },
                                    "range": [
                                        50,
                                        54
                                    ],
                                    "loc": {
                                        "start": {
                                            "line": 1,
                                            "column": 50
                                        },
                                        "end": {
                                            "line": 1,
                                            "column": 54
                                        }
                                    }
                                },
                                "children": [
                                    {
                                        "type": "Literal",
                                        "value": "monkeys /> gorillas",
                                        "raw": "monkeys /> gorillas",
                                        "range": [
                                            31,
                                            50
                                        ],
                                        "loc": {
                                            "start": {
                                                "line": 1,
                                                "column": 31
                                            },
                                            "end": {
                                                "line": 1,
                                                "column": 50
                                            }
                                        }
                                    }
                                ],
                                "range": [
                                    28,
                                    54
                                ],
                                "loc": {
                                    "start": {
                                        "line": 1,
                                        "column": 28
                                    },
                                    "end": {
                                        "line": 1,
                                        "column": 54
                                    }
                                }
                            },
                            "range": [
                                22,
                                54
                            ],
                            "loc": {
                                "start": {
                                    "line": 1,
                                    "column": 22
                                },
                                "end": {
                                    "line": 1,
                                    "column": 54
                                }
                            }
                        }
                    ],
                    "range": [
                        0,
                        57
                    ],
                    "loc": {
                        "start": {
                            "line": 1,
                            "column": 0
                        },
                        "end": {
                            "line": 1,
                            "column": 57
                        }
                    }
                },
                "children": [],
                "range": [
                    0,
                    57
                ],
                "loc": {
                    "start": {
                        "line": 1,
                        "column": 0
                    },
                    "end": {
                        "line": 1,
                        "column": 57
                    }
                }
            },
            "range": [
                0,
                57
            ],
            "loc": {
                "start": {
                    "line": 1,
                    "column": 0
                },
                "end": {
                    "line": 1,
                    "column": 57
                }
            }
        }
    },

    'Invalid XJS Syntax': {
        '</>': {
            index: 1,
            lineNumber: 1,
            column: 2,
            message: 'Error: Line 1: Unexpected token /',
            description: 'Unexpected token /'
        },

        '<a: />': {
            index: 3,
            lineNumber: 1,
            column: 4,
            message: 'Error: Line 1: XJS tag name can not be empty'
        },

        '<:a />': {
            index: 1,
            lineNumber: 1,
            column: 2,
            message: 'Error: Line 1: Unexpected token :',
            description: 'Unexpected token :'
        },

        '<a b=d />': {
            index: 5,
            lineNumber: 1,
            column: 6,
            message: 'Error: Line 1: XJS value should be either an expression or a quoted XJS text'
        },

        '<a>': {
            index: 3,
            lineNumber: 1,
            column: 4,
            message: 'Error: Line 1: Unexpected end of input'
        },

        '<a></b>': {
            index: 7,
            lineNumber: 1,
            column: 8,
            message: 'Error: Line 1: Expected corresponding XJS closing tag for a'
        },

        '<a foo="bar': {
            index: 11,
            lineNumber: 1,
            column: 12,
            message: "Error: Line 1: Unexpected token ILLEGAL"
        },

        '<a:b></b>': {
            index: 9,
            lineNumber: 1,
            column: 10,
            message: "Error: Line 1: Expected corresponding XJS closing tag for a:b",
        },

        '<a><a />': {
            index: 8,
            lineNumber: 1,
            column: 9,
            message: 'Error: Line 1: Unexpected end of input'
        },

        '<a b={}>': {
            index: 7,
            lineNumber: 1,
            column: 8,
            message: 'Error: Line 1: XJS attributes must only be assigned a non-empty expression'
        },

        '<a>{"str";}</a>': {
            index: 9,
            lineNumber: 1,
            column: 10,
            message: 'Error: Line 1: Unexpected token ;',
            description: 'Unexpected token ;'
        },

        '<span className="a", id="b" />': {
            index: 19,
            lineNumber: 1,
            column: 20,
            message: 'Error: Line 1: Unexpected token ,',
            description: 'Unexpected token ,'
        },

        '<div className"app">': {
            index: 14,
            lineNumber: 1,
            column: 15,
            message: 'Error: Line 1: Unexpected string',
            description: 'Unexpected string'
        }
    },

    'Type Annotations': {
        'function foo(numVal: number){}': {
            type: 'FunctionDeclaration',
            id: {
                type: 'Identifier',
                name: 'foo',
                range: [9, 12],
                loc: {
                    start: { line: 1, column: 9 },
                    end: { line: 1, column: 12 }
                }
            },
            params: [{
                type: 'TypeAnnotatedIdentifier',
                id: {
                    type: 'Identifier',
                    name: 'numVal',
                    range: [13, 19],
                    loc: {
                        start: { line: 1, column: 13 },
                        end: { line: 1, column: 19 }
                    }
                },
                annotation: {
                    type: 'TypeAnnotation',
                    id: {
                        type: 'Identifier',
                        name: 'number',
                        range: [21, 27],
                        loc: {
                            start: { line: 1, column: 21 },
                            end: { line: 1, column: 27 }
                        }
                    },
                    paramTypes: null,
                    returnType: null,
                    nullable: false,
                    range: [19, 27],
                    loc: {
                        start: { line: 1, column: 19 },
                        end: { line: 1, column: 27 }
                    }
                },
                range: [13, 27],
                loc: {
                    start: { line: 1, column: 13 },
                    end: { line: 1, column: 27 }
                }
            }],
            defaults: [],
            body: {
                type: 'BlockStatement',
                body: [],
                range: [28, 30],
                loc: {
                    start: { line: 1, column: 28 },
                    end: { line: 1, column: 30 }
                }
            },
            rest: null,
            generator: false,
            expression: false,
            range: [0, 30],
            loc: {
                start: { line: 1, column: 0 },
                end: { line: 1, column: 30 }
            }
        },

        'function foo(numVal: number, strVal: string){}': {
              type: 'FunctionDeclaration',
              id: {
                  type: 'Identifier',
                  name: 'foo',
                  range: [9, 12],
                  loc: {
                      start: { line: 1, column: 9 },
                      end: { line: 1, column: 12 }
                  }
              },
              params: [{
                  type: 'TypeAnnotatedIdentifier',
                  id: {
                      type: 'Identifier',
                      name: 'numVal',
                      range: [13, 19],
                      loc: {
                          start: { line: 1, column: 13 },
                          end: { line: 1, column: 19 }
                      }
                  },
                  annotation: {
                      type: 'TypeAnnotation',
                      id: {
                          type: 'Identifier',
                          name: 'number',
                          range: [21, 27],
                          loc: {
                              start: { line: 1, column: 21 },
                              end: { line: 1, column: 27 }
                          }
                      },
                      paramTypes: null,
                      returnType: null,
                      nullable: false,
                      range: [19, 27],
                      loc: {
                          start: { line: 1, column: 19 },
                          end: { line: 1, column: 27 }
                      }
                  },
                  range: [13, 27],
                  loc: {
                      start: { line: 1, column: 13 },
                      end: { line: 1, column: 27 }
                  }
              }, {
                  type: 'TypeAnnotatedIdentifier',
                  id: {
                      type: 'Identifier',
                      name: 'strVal',
                      range: [29, 35],
                      loc: {
                          start: { line: 1, column: 29 },
                          end: { line: 1, column: 35 }
                      }
                  },
                  annotation: {
                      type: 'TypeAnnotation',
                      id: {
                          type: 'Identifier',
                          name: 'string',
                          range: [37, 43],
                          loc: {
                              start: { line: 1, column: 37 },
                              end: { line: 1, column: 43 }
                          }
                      },
                      paramTypes: null,
                      returnType: null,
                      nullable: false,
                      range: [35, 43],
                      loc: {
                          start: { line: 1, column: 35 },
                          end: { line: 1, column: 43 }
                      }
                  },
                  range: [29, 43],
                  loc: {
                      start: { line: 1, column: 29 },
                      end: { line: 1, column: 43 }
                  }
              }],
              defaults: [],
              body: {
                  type: 'BlockStatement',
                  body: [],
                  range: [44, 46],
                  loc: {
                      start: { line: 1, column: 44 },
                      end: { line: 1, column: 46 }
                  }
              },
              rest: null,
              generator: false,
              expression: false,
              range: [0, 46],
              loc: {
                  start: { line: 1, column: 0 },
                  end: { line: 1, column: 46 }
              }
        },

        'function foo(numVal: number, untypedVal){}': {
              type: 'FunctionDeclaration',
              id: {
                  type: 'Identifier',
                  name: 'foo',
                  range: [9, 12],
                  loc: {
                      start: { line: 1, column: 9 },
                      end: { line: 1, column: 12 }
                  }
              },
              params: [{
                  type: 'TypeAnnotatedIdentifier',
                  id: {
                      type: 'Identifier',
                      name: 'numVal',
                      range: [13, 19],
                      loc: {
                          start: { line: 1, column: 13 },
                          end: { line: 1, column: 19 }
                      }
                  },
                  annotation: {
                      type: 'TypeAnnotation',
                      id: {
                          type: 'Identifier',
                          name: 'number',
                          range: [21, 27],
                          loc: {
                              start: { line: 1, column: 21 },
                              end: { line: 1, column: 27 }
                          }
                      },
                      paramTypes: null,
                      returnType: null,
                      nullable: false,
                      range: [19, 27],
                      loc: {
                          start: { line: 1, column: 19 },
                          end: { line: 1, column: 27 }
                      }
                  },
                  range: [13, 27],
                  loc: {
                      start: { line: 1, column: 13 },
                      end: { line: 1, column: 27 }
                  }
              }, {
                  type: 'Identifier',
                  name: 'untypedVal',
                  range: [29, 39],
                  loc: {
                      start: { line: 1, column: 29 },
                      end: { line: 1, column: 39 }
                  }
              }],
              defaults: [],
              body: {
                  type: 'BlockStatement',
                  body: [],
                  range: [40, 42],
                  loc: {
                      start: { line: 1, column: 40 },
                      end: { line: 1, column: 42 }
                  }
              },
              rest: null,
              generator: false,
              expression: false,
              range: [0, 42],
              loc: {
                  start: { line: 1, column: 0 },
                  end: { line: 1, column: 42 }
              }
        },

        'function foo(untypedVal, numVal: number){}': {
            type: 'FunctionDeclaration',
            id: {
                type: 'Identifier',
                name: 'foo',
                range: [9, 12],
                loc: {
                    start: { line: 1, column: 9 },
                    end: { line: 1, column: 12 }
                }
            },
            params: [{
                type: 'Identifier',
                name: 'untypedVal',
                range: [13, 23],
                loc: {
                    start: { line: 1, column: 13 },
                    end: { line: 1, column: 23 }
                }
            }, {
                type: 'TypeAnnotatedIdentifier',
                id: {
                    type: 'Identifier',
                    name: 'numVal',
                    range: [25, 31],
                    loc: {
                        start: { line: 1, column: 25 },
                        end: { line: 1, column: 31 }
                    }
                },
                annotation: {
                    type: 'TypeAnnotation',
                    id: {
                        type: 'Identifier',
                        name: 'number',
                        range: [33, 39],
                        loc: {
                            start: { line: 1, column: 33 },
                            end: { line: 1, column: 39 }
                        }
                    },
                    paramTypes: null,
                    returnType: null,
                    nullable: false,
                    range: [31, 39],
                    loc: {
                        start: { line: 1, column: 31 },
                        end: { line: 1, column: 39 }
                    }
                },
                range: [25, 39],
                loc: {
                    start: { line: 1, column: 25 },
                    end: { line: 1, column: 39 }
                }
            }],
            defaults: [],
            body: {
                type: 'BlockStatement',
                body: [],
                range: [40, 42],
                loc: {
                    start: { line: 1, column: 40 },
                    end: { line: 1, column: 42 }
                }
            },
            rest: null,
            generator: false,
            expression: false,
            range: [0, 42],
            loc: {
                start: { line: 1, column: 0 },
                end: { line: 1, column: 42 }
            }
        },

        'function foo(nullableNum: ?number){}': {
            type: 'FunctionDeclaration',
            id: {
                type: 'Identifier',
                name: 'foo',
                range: [9, 12],
                loc: {
                    start: { line: 1, column: 9 },
                    end: { line: 1, column: 12 }
                }
            },
            params: [{
                type: 'TypeAnnotatedIdentifier',
                id: {
                    type: 'Identifier',
                    name: 'nullableNum',
                    range: [13, 24],
                    loc: {
                        start: { line: 1, column: 13 },
                        end: { line: 1, column: 24 }
                    }
                },
                annotation: {
                    type: 'TypeAnnotation',
                    id: {
                        type: 'Identifier',
                        name: 'number',
                        range: [27, 33],
                        loc: {
                            start: { line: 1, column: 27 },
                            end: { line: 1, column: 33 }
                        }
                    },
                    paramTypes: null,
                    returnType: null,
                    nullable: true,
                    range: [24, 33],
                    loc: {
                        start: { line: 1, column: 24 },
                        end: { line: 1, column: 33 }
                    }
                },
                range: [13, 33],
                loc: {
                    start: { line: 1, column: 13 },
                    end: { line: 1, column: 33 }
                }
            }],
            defaults: [],
            body: {
                type: 'BlockStatement',
                body: [],
                range: [34, 36],
                loc: {
                    start: { line: 1, column: 34 },
                    end: { line: 1, column: 36 }
                }
            },
            rest: null,
            generator: false,
            expression: false,
            range: [0, 36],
            loc: {
                start: { line: 1, column: 0 },
                end: { line: 1, column: 36 }
            }
        },

        'function foo(callback: () => void){}': {
            type: 'FunctionDeclaration',
            id: {
                type: 'Identifier',
                name: 'foo',
                range: [9, 12],
                loc: {
                    start: { line: 1, column: 9 },
                    end: { line: 1, column: 12 }
                }
            },
            params: [{
                type: 'TypeAnnotatedIdentifier',
                id: {
                    type: 'Identifier',
                    name: 'callback',
                    range: [13, 21],
                    loc: {
                        start: { line: 1, column: 13 },
                        end: { line: 1, column: 21 }
                    }
                },
                annotation: {
                    type: 'TypeAnnotation',
                    id: null,
                    paramTypes: [],
                    returnType: null,
                    nullable: false,
                    range: [21, 33],
                    loc: {
                        start: { line: 1, column: 21 },
                        end: { line: 1, column: 33 }
                    }
                },
                range: [13, 33],
                loc: {
                    start: { line: 1, column: 13 },
                    end: { line: 1, column: 33 }
                }
            }],
            defaults: [],
            body: {
                type: 'BlockStatement',
                body: [],
                range: [34, 36],
                loc: {
                    start: { line: 1, column: 34 },
                    end: { line: 1, column: 36 }
                }
            },
            rest: null,
            generator: false,
            expression: false,
            range: [0, 36],
            loc: {
                start: { line: 1, column: 0 },
                end: { line: 1, column: 36 }
            }
        },

        'function foo(callback: () => number){}': {
            type: 'FunctionDeclaration',
            id: {
                type: 'Identifier',
                name: 'foo',
                range: [9, 12],
                loc: {
                    start: { line: 1, column: 9 },
                    end: { line: 1, column: 12 }
                }
            },
            params: [{
                type: 'TypeAnnotatedIdentifier',
                id: {
                    type: 'Identifier',
                    name: 'callback',
                    range: [13, 21],
                    loc: {
                        start: { line: 1, column: 13 },
                        end: { line: 1, column: 21 }
                    }
                },
                annotation: {
                    type: 'TypeAnnotation',
                    id: null,
                    paramTypes: [],
                    returnType: {
                        type: 'TypeAnnotation',
                        id: {
                            type: 'Identifier',
                            name: 'number',
                            range: [29, 35],
                            loc: {
                                start: { line: 1, column: 29 },
                                end: { line: 1, column: 35 }
                            }
                        },
                        paramTypes: null,
                        returnType: null,
                        nullable: false,
                        range: [29, 35],
                        loc: {
                            start: { line: 1, column: 29 },
                            end: { line: 1, column: 35 }
                        }
                    },
                    nullable: false,
                    range: [21, 35],
                    loc: {
                        start: { line: 1, column: 21 },
                        end: { line: 1, column: 35 }
                    }
                },
                range: [13, 35],
                loc: {
                    start: { line: 1, column: 13 },
                    end: { line: 1, column: 35 }
                }
            }],
            defaults: [],
            body: {
                type: 'BlockStatement',
                body: [],
                range: [36, 38],
                loc: {
                    start: { line: 1, column: 36 },
                    end: { line: 1, column: 38 }
                }
            },
            rest: null,
            generator: false,
            expression: false,
            range: [0, 38],
            loc: {
                start: { line: 1, column: 0 },
                end: { line: 1, column: 38 }
            }
        },

        'function foo(callback: (bool) => number){}': {
            type: 'FunctionDeclaration',
            id: {
                type: 'Identifier',
                name: 'foo',
                range: [9, 12],
                loc: {
                    start: { line: 1, column: 9 },
                    end: { line: 1, column: 12 }
                }
            },
            params: [{
                type: 'TypeAnnotatedIdentifier',
                id: {
                    type: 'Identifier',
                    name: 'callback',
                    range: [13, 21],
                    loc: {
                        start: { line: 1, column: 13 },
                        end: { line: 1, column: 21 }
                    }
                },
                annotation: {
                    type: 'TypeAnnotation',
                    id: null,
                    paramTypes: [{
                        type: 'TypeAnnotation',
                        id: {
                            type: 'Identifier',
                            name: 'bool',
                            range: [24, 28],
                            loc: {
                                start: { line: 1, column: 24 },
                                end: { line: 1, column: 28 }
                            }
                        },
                        paramTypes: null,
                        returnType: null,
                        nullable: false,
                        range: [24, 28],
                        loc: {
                            start: { line: 1, column: 24 },
                            end: { line: 1, column: 28 }
                        }
                    }],
                    returnType: {
                        type: 'TypeAnnotation',
                        id: {
                            type: 'Identifier',
                            name: 'number',
                            range: [33, 39],
                            loc: {
                                start: { line: 1, column: 33 },
                                end: { line: 1, column: 39 }
                            }
                        },
                        paramTypes: null,
                        returnType: null,
                        nullable: false,
                        range: [33, 39],
                        loc: {
                            start: { line: 1, column: 33 },
                            end: { line: 1, column: 39 }
                        }
                    },
                    nullable: false,
                    range: [21, 39],
                    loc: {
                        start: { line: 1, column: 21 },
                        end: { line: 1, column: 39 }
                    }
                },
                range: [13, 39],
                loc: {
                    start: { line: 1, column: 13 },
                    end: { line: 1, column: 39 }
                }
            }],
            defaults: [],
            body: {
                type: 'BlockStatement',
                body: [],
                range: [40, 42],
                loc: {
                    start: { line: 1, column: 40 },
                    end: { line: 1, column: 42 }
                }
            },
            rest: null,
            generator: false,
            expression: false,
            range: [0, 42],
            loc: {
                start: { line: 1, column: 0 },
                end: { line: 1, column: 42 }
            }
        },

        'function foo(callback: (bool, string) => number){}': {
            type: 'FunctionDeclaration',
            id: {
                type: 'Identifier',
                name: 'foo',
                range: [9, 12],
                loc: {
                    start: { line: 1, column: 9 },
                    end: { line: 1, column: 12 }
                }
            },
            params: [{
                type: 'TypeAnnotatedIdentifier',
                id: {
                    type: 'Identifier',
                    name: 'callback',
                    range: [13, 21],
                    loc: {
                        start: { line: 1, column: 13 },
                        end: { line: 1, column: 21 }
                    }
                },
                annotation: {
                    type: 'TypeAnnotation',
                    id: null,
                    paramTypes: [{
                        type: 'TypeAnnotation',
                        id: {
                            type: 'Identifier',
                            name: 'bool',
                            range: [24, 28],
                            loc: {
                                start: { line: 1, column: 24 },
                                end: { line: 1, column: 28 }
                            }
                        },
                        paramTypes: null,
                        returnType: null,
                        nullable: false,
                        range: [24, 28],
                        loc: {
                            start: { line: 1, column: 24 },
                            end: { line: 1, column: 28 }
                        }
                    }, {
                        type: 'TypeAnnotation',
                        id: {
                            type: 'Identifier',
                            name: 'string',
                            range: [30, 36],
                            loc: {
                                start: { line: 1, column: 30 },
                                end: { line: 1, column: 36 }
                            }
                        },
                        paramTypes: null,
                        returnType: null,
                        nullable: false,
                        range: [30, 36],
                        loc: {
                            start: { line: 1, column: 30 },
                            end: { line: 1, column: 36 }
                        }
                    }],
                    returnType: {
                        type: 'TypeAnnotation',
                        id: {
                            type: 'Identifier',
                            name: 'number',
                            range: [41, 47],
                            loc: {
                                start: { line: 1, column: 41 },
                                end: { line: 1, column: 47 }
                            }
                        },
                        paramTypes: null,
                        returnType: null,
                        nullable: false,
                        range: [41, 47],
                        loc: {
                            start: { line: 1, column: 41 },
                            end: { line: 1, column: 47 }
                        }
                    },
                    nullable: false,
                    range: [21, 47],
                    loc: {
                        start: { line: 1, column: 21 },
                        end: { line: 1, column: 47 }
                    }
                },
                range: [13, 47],
                loc: {
                    start: { line: 1, column: 13 },
                    end: { line: 1, column: 47 }
                }
            }],
            defaults: [],
            body: {
                type: 'BlockStatement',
                body: [],
                range: [48, 50],
                loc: {
                    start: { line: 1, column: 48 },
                    end: { line: 1, column: 50 }
                }
            },
            rest: null,
            generator: false,
            expression: false,
            range: [0, 50],
            loc: {
                start: { line: 1, column: 0 },
                end: { line: 1, column: 50 }
            }
        },

        'function foo():number{}': {
            type: 'FunctionDeclaration',
            id: {
                type: 'Identifier',
                name: 'foo',
                range: [9, 12],
                loc: {
                    start: { line: 1, column: 9 },
                    end: { line: 1, column: 12 }
                }
            },
            params: [],
            defaults: [],
            body: {
                type: 'BlockStatement',
                body: [],
                range: [21, 23],
                loc: {
                    start: { line: 1, column: 21 },
                    end: { line: 1, column: 23 }
                }
            },
            rest: null,
            generator: false,
            expression: false,
            returnType: {
                type: 'TypeAnnotation',
                id: {
                    type: 'Identifier',
                    name: 'number',
                    range: [15, 21],
                    loc: {
                        start: { line: 1, column: 15 },
                        end: { line: 1, column: 21 }
                    }
                },
                paramTypes: null,
                returnType: null,
                nullable: false,
                range: [14, 21],
                loc: {
                    start: { line: 1, column: 14 },
                    end: { line: 1, column: 21 }
                }
            },
            range: [0, 23],
            loc: {
                start: { line: 1, column: 0 },
                end: { line: 1, column: 23 }
            }
        },

        'function foo():() => void{}': {
            type: 'FunctionDeclaration',
            id: {
                type: 'Identifier',
                name: 'foo',
                range: [9, 12],
                loc: {
                    start: { line: 1, column: 9 },
                    end: { line: 1, column: 12 }
                }
            },
            params: [],
            defaults: [],
            body: {
                type: 'BlockStatement',
                body: [],
                range: [25, 27],
                loc: {
                    start: { line: 1, column: 25 },
                    end: { line: 1, column: 27 }
                }
            },
            rest: null,
            generator: false,
            expression: false,
            returnType: {
                type: 'TypeAnnotation',
                id: null,
                paramTypes: [],
                returnType: null,
                nullable: false,
                range: [14, 25],
                loc: {
                    start: { line: 1, column: 14 },
                    end: { line: 1, column: 25 }
                }
            },
            range: [0, 27],
            loc: {
                start: { line: 1, column: 0 },
                end: { line: 1, column: 27 }
            }
        },

        'function foo():(bool) => number{}': {
            type: 'FunctionDeclaration',
            id: {
                type: 'Identifier',
                name: 'foo',
                range: [9, 12],
                loc: {
                    start: { line: 1, column: 9 },
                    end: { line: 1, column: 12 }
                }
            },
            params: [],
            defaults: [],
            body: {
                type: 'BlockStatement',
                body: [],
                range: [31, 33],
                loc: {
                    start: { line: 1, column: 31 },
                    end: { line: 1, column: 33 }
                }
            },
            rest: null,
            generator: false,
            expression: false,
            returnType: {
                type: 'TypeAnnotation',
                id: null,
                paramTypes: [{
                    type: 'TypeAnnotation',
                    id: {
                        type: 'Identifier',
                        name: 'bool',
                        range: [16, 20],
                        loc: {
                            start: { line: 1, column: 16 },
                            end: { line: 1, column: 20 }
                        }
                    },
                    paramTypes: null,
                    returnType: null,
                    nullable: false,
                    range: [16, 20],
                    loc: {
                        start: { line: 1, column: 16 },
                        end: { line: 1, column: 20 }
                    }
                }],
                returnType: {
                    type: 'TypeAnnotation',
                    id: {
                        type: 'Identifier',
                        name: 'number',
                        range: [25, 31],
                        loc: {
                            start: { line: 1, column: 25 },
                            end: { line: 1, column: 31 }
                        }
                    },
                    paramTypes: null,
                    returnType: null,
                    nullable: false,
                    range: [25, 31],
                    loc: {
                        start: { line: 1, column: 25 },
                        end: { line: 1, column: 31 }
                    }
                },
                nullable: false,
                range: [14, 31],
                loc: {
                    start: { line: 1, column: 14 },
                    end: { line: 1, column: 31 }
                }
            },
            range: [0, 33],
            loc: {
                start: { line: 1, column: 0 },
                end: { line: 1, column: 33 }
            }
        },

        'a={set fooProp(value:number){}}': {
            type: 'ExpressionStatement',
            expression: {
                type: 'AssignmentExpression',
                operator: '=',
                left: {
                    type: 'Identifier',
                    name: 'a',
                    range: [0, 1],
                    loc: {
                        start: { line: 1, column: 0 },
                        end: { line: 1, column: 1 }
                    }
                },
                right: {
                    type: 'ObjectExpression',
                    properties: [{
                        type: 'Property',
                        key: {
                            type: 'Identifier',
                            name: 'fooProp',
                            range: [7, 14],
                            loc: {
                                start: { line: 1, column: 7 },
                                end: { line: 1, column: 14 }
                            }
                        },
                        value: {
                            type: 'FunctionExpression',
                            id: null,
                            params: [{
                                type: 'TypeAnnotatedIdentifier',
                                id: {
                                    type: 'Identifier',
                                    name: 'value',
                                    range: [15, 20],
                                    loc: {
                                        start: { line: 1, column: 15 },
                                        end: { line: 1, column: 20 }
                                    }
                                },
                                annotation: {
                                    type: 'TypeAnnotation',
                                    id: {
                                        type: 'Identifier',
                                        name: 'number',
                                        range: [21, 27],
                                        loc: {
                                            start: { line: 1, column: 21 },
                                            end: { line: 1, column: 27 }
                                        }
                                    },
                                    paramTypes: null,
                                    returnType: null,
                                    nullable: false,
                                    range: [20, 27],
                                    loc: {
                                        start: { line: 1, column: 20 },
                                        end: { line: 1, column: 27 }
                                    }
                                },
                                range: [15, 27],
                                loc: {
                                    start: { line: 1, column: 15 },
                                    end: { line: 1, column: 27 }
                                }
                            }],
                            defaults: [],
                            body: {
                                type: 'BlockStatement',
                                body: [],
                                range: [28, 30],
                                loc: {
                                    start: { line: 1, column: 28 },
                                    end: { line: 1, column: 30 }
                                }
                            },
                            rest: null,
                            generator: false,
                            expression: false,
                            range: [28, 30],
                            loc: {
                                start: { line: 1, column: 28 },
                                end: { line: 1, column: 30 }
                            }
                        },
                        kind: 'set',
                        method: false,
                        shorthand: false,
                        range: [3, 30],
                        loc: {
                            start: { line: 1, column: 3 },
                            end: { line: 1, column: 30 }
                        }
                    }],
                    range: [2, 31],
                    loc: {
                        start: { line: 1, column: 2 },
                        end: { line: 1, column: 31 }
                    }
                },
                range: [0, 31],
                loc: {
                    start: { line: 1, column: 0 },
                    end: { line: 1, column: 31 }
                }
            },
            range: [0, 31],
            loc: {
                start: { line: 1, column: 0 },
                end: { line: 1, column: 31 }
            }
        },

        'class Foo {set fooProp(value:number){}}': {
            type: 'ClassDeclaration',
            id: {
                type: 'Identifier',
                name: 'Foo',
                range: [6, 9],
                loc: {
                    start: { line: 1, column: 6 },
                    end: { line: 1, column: 9 }
                }
            },
            superClass: null,
            body: {
                type: 'ClassBody',
                body: [{
                    type: 'MethodDefinition',
                    key: {
                        type: 'Identifier',
                        name: 'fooProp',
                        range: [15, 22],
                        loc: {
                            start: { line: 1, column: 15 },
                            end: { line: 1, column: 22 }
                        }
                    },
                    value: {
                        type: 'FunctionExpression',
                        id: null,
                        params: [{
                            type: 'TypeAnnotatedIdentifier',
                            id: {
                                type: 'Identifier',
                                name: 'value',
                                range: [23, 28],
                                loc: {
                                    start: { line: 1, column: 23 },
                                    end: { line: 1, column: 28 }
                                }
                            },
                            annotation: {
                                type: 'TypeAnnotation',
                                id: {
                                    type: 'Identifier',
                                    name: 'number',
                                    range: [29, 35],
                                    loc: {
                                        start: { line: 1, column: 29 },
                                        end: { line: 1, column: 35 }
                                    }
                                },
                                paramTypes: null,
                                returnType: null,
                                nullable: false,
                                range: [28, 35],
                                loc: {
                                    start: { line: 1, column: 28 },
                                    end: { line: 1, column: 35 }
                                }
                            },
                            range: [23, 35],
                            loc: {
                                start: { line: 1, column: 23 },
                                end: { line: 1, column: 35 }
                            }
                        }],
                        defaults: [],
                        body: {
                            type: 'BlockStatement',
                            body: [],
                            range: [36, 38],
                            loc: {
                                start: { line: 1, column: 36 },
                                end: { line: 1, column: 38 }
                            }
                        },
                        rest: null,
                        generator: false,
                        expression: false,
                        range: [36, 38],
                        loc: {
                            start: { line: 1, column: 36 },
                            end: { line: 1, column: 38 }
                        }
                    },
                    kind: 'set',
                    'static': false,
                    range: [11, 38],
                    loc: {
                        start: { line: 1, column: 11 },
                        end: { line: 1, column: 38 }
                    }
                }],
                range: [10, 39],
                loc: {
                    start: { line: 1, column: 10 },
                    end: { line: 1, column: 39 }
                }
            },
            range: [0, 39],
            loc: {
                start: { line: 1, column: 0 },
                end: { line: 1, column: 39 }
            }
        },

        'var numVal:number;': {
            type: 'VariableDeclaration',
            declarations: [{
                type: 'VariableDeclarator',
                id: {
                    type: 'TypeAnnotatedIdentifier',
                    id: {
                        type: 'Identifier',
                        name: 'numVal',
                        range: [4, 10],
                        loc: {
                            start: { line: 1, column: 4 },
                            end: { line: 1, column: 10 }
                        }
                    },
                    annotation: {
                        type: 'TypeAnnotation',
                        id: {
                            type: 'Identifier',
                            name: 'number',
                            range: [11, 17],
                            loc: {
                                start: { line: 1, column: 11 },
                                end: { line: 1, column: 17 }
                            }
                        },
                        paramTypes: null,
                        returnType: null,
                        nullable: false,
                        range: [10, 17],
                        loc: {
                            start: { line: 1, column: 10 },
                            end: { line: 1, column: 17 }
                        }
                    },
                    range: [4, 17],
                    loc: {
                        start: { line: 1, column: 4 },
                        end: { line: 1, column: 17 }
                    }
                },
                init: null,
                range: [4, 17],
                loc: {
                    start: { line: 1, column: 4 },
                    end: { line: 1, column: 17 }
                }
            }],
            kind: 'var',
            range: [0, 18],
            loc: {
                start: { line: 1, column: 0 },
                end: { line: 1, column: 18 }
            }
        },

        'var numVal:number = otherNumVal;': {
            type: 'VariableDeclaration',
            declarations: [{
                type: 'VariableDeclarator',
                id: {
                    type: 'TypeAnnotatedIdentifier',
                    id: {
                        type: 'Identifier',
                        name: 'numVal',
                        range: [4, 10],
                        loc: {
                            start: { line: 1, column: 4 },
                            end: { line: 1, column: 10 }
                        }
                    },
                    annotation: {
                        type: 'TypeAnnotation',
                        id: {
                            type: 'Identifier',
                            name: 'number',
                            range: [11, 17],
                            loc: {
                                start: { line: 1, column: 11 },
                                end: { line: 1, column: 17 }
                            }
                        },
                        paramTypes: null,
                        returnType: null,
                        nullable: false,
                        range: [10, 17],
                        loc: {
                            start: { line: 1, column: 10 },
                            end: { line: 1, column: 17 }
                        }
                    },
                    range: [4, 17],
                    loc: {
                        start: { line: 1, column: 4 },
                        end: { line: 1, column: 17 }
                    }
                },
                init: {
                    type: 'Identifier',
                    name: 'otherNumVal',
                    range: [20, 31],
                    loc: {
                        start: { line: 1, column: 20 },
                        end: { line: 1, column: 31 }
                    }
                },
                range: [4, 31],
                loc: {
                    start: { line: 1, column: 4 },
                    end: { line: 1, column: 31 }
                }
            }],
            kind: 'var',
            range: [0, 32],
            loc: {
                start: { line: 1, column: 0 },
                end: { line: 1, column: 32 }
            }
        }
    }
};

// Merge fbTestFixture in to testFixture

(function () {

    'use strict';

    var i, fixtures;

    for (i in fbTestFixture) {
        if (fbTestFixture.hasOwnProperty(i)) {
            fixtures = fbTestFixture[i];
            if (i !== 'Syntax' && testFixture.hasOwnProperty(i)) {
                throw new Error('FB test should not replace existing test for ' + i);
            }
            testFixture[i] = fixtures;
        }
    }

}());
