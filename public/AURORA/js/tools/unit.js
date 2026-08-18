/* Extracted from unit.html (refactor script). Tool logic. */

        const units = {
            length: {
                name: '长度',
                rates: {
                    m: 1,
                    km: 1000,
                    cm: 0.01,
                    mm: 0.001,
                    inch: 0.0254,
                    ft: 0.3048,
                    yd: 0.9144,
                    mile: 1609.344
                },
                names: {
                    m: '米 (m)', km: '千米 (km)', cm: '厘米 (cm)', mm: '毫米 (mm)',
                    inch: '英寸 (in)', ft: '英尺 (ft)', yd: '码 (yd)', mile: '英里 (mi)'
                }
            },
            weight: {
                name: '重量',
                rates: {
                    kg: 1,
                    g: 0.001,
                    mg: 0.000001,
                    t: 1000,
                    lb: 0.45359237,
                    oz: 0.0283495
                },
                names: {
                    kg: '千克 (kg)', g: '克 (g)', mg: '毫克 (mg)', t: '吨 (t)',
                    lb: '磅 (lb)', oz: '盎司 (oz)'
                }
            },
            area: {
                name: '面积',
                rates: {
                    sqm: 1,
                    sqkm: 1000000,
                    sqft: 0.092903,
                    acre: 4046.86,
                    hectare: 10000
                },
                names: {
                    sqm: '平方米 (m²)', sqkm: '平方千米 (km²)', sqft: '平方英尺 (ft²)',
                    acre: '英亩 (ac)', hectare: '公顷 (ha)'
                }
            },
            volume: {
                name: '体积',
                rates: {
                    l: 1,
                    ml: 0.001,
                    m3: 1000,
                    gal: 3.78541
                },
                names: {
                    l: '升 (L)', ml: '毫升 (mL)', m3: '立方米 (m³)', gal: '加仑 (gal)'
                }
            },
            temperature: {
                name: '温度',
                // Temp needs special handling logic
                special: true
            },
            data: {
                name: '数据存储',
                rates: {
                    B: 1,
                    KB: 1024,
                    MB: 1048576,
                    GB: 1073741824,
                    TB: 1099511627776
                },
                names: {
                    B: 'Byte', KB: 'KB', MB: 'MB', GB: 'GB', TB: 'TB'
                }
            }
        };

        let currentType = 'length';

        function init() {
            const selector = document.getElementById('type-selector');
            Object.keys(units).forEach(key => {
                const btn = document.createElement('button');
                btn.className = `type-btn ${key === currentType ? 'active' : ''}`;
                btn.innerText = units[key].name;
                btn.onclick = () => switchType(key, btn);
                selector.appendChild(btn);
            });
            renderOptions();
        }

        function switchType(type, btn) {
            currentType = type;
            document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderOptions();
            document.getElementById('val-from').value = '';
            document.getElementById('val-to').value = '';
        }

        function renderOptions() {
            const fromSel = document.getElementById('unit-from');
            const toSel = document.getElementById('unit-to');
            fromSel.innerHTML = '';
            toSel.innerHTML = '';

            const unitData = units[currentType];
            const keys = unitData.special ? ['c', 'f', 'k'] : Object.keys(unitData.rates);
            const names = unitData.special ? { c: '摄氏度 (°C)', f: '华氏度 (°F)', k: '开尔文 (K)' } : unitData.names;

            keys.forEach(k => {
                const opt1 = new Option(names[k], k);
                const opt2 = new Option(names[k], k);
                fromSel.add(opt1);
                toSel.add(opt2);
            });

            // Default selection
            if(keys.length > 1) toSel.selectedIndex = 1;
        }

        function convert(direction) {
            const fromVal = parseFloat(document.getElementById(direction === 'from' ? 'val-from' : 'val-to').value);
            if (isNaN(fromVal)) {
                document.getElementById(direction === 'from' ? 'val-to' : 'val-from').value = '';
                return;
            }

            const fromUnit = document.getElementById(direction === 'from' ? 'unit-from' : 'unit-to').value;
            const toUnit = document.getElementById(direction === 'from' ? 'unit-to' : 'unit-from').value;
            const targetInput = document.getElementById(direction === 'from' ? 'val-to' : 'val-from');

            let result;

            if (units[currentType].special && currentType === 'temperature') {
                // Temp conversion
                let celsius;
                // To Celsius
                if (fromUnit === 'c') celsius = fromVal;
                else if (fromUnit === 'f') celsius = (fromVal - 32) * 5/9;
                else if (fromUnit === 'k') celsius = fromVal - 273.15;

                // From Celsius
                if (toUnit === 'c') result = celsius;
                else if (toUnit === 'f') result = (celsius * 9/5) + 32;
                else if (toUnit === 'k') result = celsius + 273.15;
            } else {
                // Standard rate conversion
                // base = val * rate[from]
                // res = base / rate[to]
                // Actually: base unit is the one with rate 1.
                // val in base = val * rate[from]
                // val in target = (val * rate[from]) / rate[to]
                const rates = units[currentType].rates;
                const baseVal = fromVal * rates[fromUnit];
                result = baseVal / rates[toUnit];
            }

            // Format result
            targetInput.value = parseFloat(result.toPrecision(10)); // Avoid floating point errors
        }

        init();
    

        // data-action registrations (replaces inline onclick=/onchange=/oninput=)
        if (window.app && app.action) {
            app.action('convert', function (el) { convert(el.dataset.mode); });
        }
    
