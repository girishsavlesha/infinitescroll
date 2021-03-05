function infiniteScroll(options) {
    options = extend({
        loader: true,
        container: '.module',
        trigger: 5,
        limit: 1,
        customloader: null,
        duration: 500,
    }, options || {})

    function extend() {
        var obj, name, copy,
            target = arguments[0] || {},
            i = 1,
            length = arguments.length;

        for (; i < length; i++) {
            if ((obj = arguments[i]) !== null) {
                for (name in obj) {
                    copy = obj[name];

                    if (target === copy) {
                        continue;
                    } else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }
        return target;
    }

    // get element nodes from selectors
    var supportConsoleWarn = window.console && typeof window.console.warn === "function",
        scrollList = ['container', 'loader', 'customloader'],
        optionsElements = {};

    scrollList.forEach(function (item) {
        if (typeof options[item] === 'string') {
            var str = options[item],
                el = document.querySelector(str);
            optionsElements[item] = str;

            if (el && el.nodeName) {
                options[item] = el;
            } else {
                if (supportConsoleWarn) {
                    console.warn('Can\'t find', options[item]);
                }
                return;
            }
        }
    });

    //make sure 1 element is present
    if (options.container.children.length < 1) {
        if (supportConsoleWarn) {
            console.warn('No element found in', options.container);
        }
        return;
    }

    // append class name
    var container = options.container,
        iscrollItems = container.children;

    function forEach(arr, callback, scope) {
        for (var i = 0, l = arr.length; i < l; i++) {
            callback.call(scope, arr[i], i);
        }
    }

    function getSections(page, iscrollItems, limit) {
        var data = [];
        const startIndex = (page - 1) * limit + 1;
        for (i = startIndex; i <= startIndex + limit - 1; i++) {
            data.push(iscrollItems[i])
        }
        return data;
    }

    function showSections(elements) {
        if (elements) {
            forEach(elements, function (item, i) {
                item.style.display = "block";
            });
        }
    }
    //append loader
    var loaderSelector;

    if (typeof (options.loader) === 'boolean') {
        if (options.loader === true) {
            appendLoader(container);
            loaderSelector = '.loader'
        } else if (options.loader === false) {
            if (options.customloader) {
                loaderSelector = options.customloader;
            }

        }
    }

    function appendLoader(container) {
        var loaderHtml = `<div class="loader">
        <div class="loader-circle c1"></div>
        <div class="loader-circle c2"></div>
        <div class="loader-circle c3"></div>
        <div class="loader-circle c4"></div>
        <div class="loader-circle c5"></div>
        <div class="loader-circle c6"></div>
      </div>`

        var loaderStyle = `.loader {
        width: 100px;
        height: 100px;
        position: relative;
        margin: auto;
      }
      
      .loader-circle {
        width: 100%;
        height: 100%;
        position: absolute;
      }
      
      .loader-circle::before {
        content: '';
        width: 15%;
        height: 15%;
        background: #C4C4C4;
        display: block;
        border-radius: 100%;
        margin: 27px auto;
        animation: loading 1.2s infinite ease-in-out both;
      }
      
      .c1 {
        transform: rotate(0deg);
      }
      
      .c2 {
        transform: rotate(60deg);
      }
      
      .c3 {
        transform: rotate(120deg);
      }
      
      .c4 {
        transform: rotate(180deg);
      }
      
      .c5 {
        transform: rotate(240deg);
      }
      
      .c6 {
        transform: rotate(300deg);
      }
      
      .c2:before {
                animation-delay: -1s; 
      }
      .c3:before {
                animation-delay: -0.8s; 
      }
      .c4:before {
                animation-delay: -0.6s; 
      }
      .c5:before {
                animation-delay: -0.4s; 
      }
      .c6:before {
                animation-delay: -0.2s; 
      }
      
      @keyframes loading {
        0%, 39%, 100% { opacity: 0; }
        40% { opacity: 1; } 
      }`

        container.insertAdjacentHTML('afterend', loaderHtml);

        var loadercss = document.createElement('style');
        loadercss.type = 'text/css';
        if (loadercss.styleSheet)
            loadercss.styleSheet.cssText = loaderStyle;
        else
            loadercss.appendChild(document.createTextNode(loaderStyle));

        document.getElementsByTagName("head")[0].appendChild(loadercss);

    }

    function hasMoreSections(page, total, limit) {
        const startIndex = (page - 1) * limit + 1;
        return total === 0 || startIndex < total;
    }


    function loadSections(page, options, loaderSelector) {
        var limit = options.limit;
        var duration = options.duration;

        showLoader(loaderSelector);
        setTimeout(async () => {
            try {
                if (hasMoreSections(page, total, limit)) {

                    //get number of elements
                    const response = await getSections(page, iscrollItems, limit);

                    //show elements
                    showSections(response);

                    //update total


                    total = iscrollItems.length;
                }

            } catch (err) {

            } finally {
                hideLoader(loaderSelector);
            }
        }, duration)
    }

    function hideLoader(loaderSelector) {
        if (loaderSelector) {
            document.querySelector(loaderSelector).style.display = 'none';
        }
    }

    function showLoader(loaderSelector) {
        if (loaderSelector) {
            document.querySelector(loaderSelector).style.display = 'block';
        }
    }
    hideLoader(loaderSelector);

    var currentCount = 1;
    const limit = options.limit;
    var total = 0;
    forEach(iscrollItems, function (item, i) {
        item.classList.add('iscroll-item' + i);
        item.style.display = "none";
    });

    window.addEventListener('scroll', () => {
        const {
            scrollTop,
            scrollHeight,
            clientHeight
        } = document.documentElement;
        const trigger = options.trigger;


        if (scrollTop + clientHeight >= scrollHeight - trigger &&
            hasMoreSections(currentCount, total, limit)) {
            currentCount++;
            loadSections(currentCount, options, loaderSelector);

        }
    }, {
        passive: true
    });
    //initial loading elements
    loadSections(currentCount, options, loaderSelector);

}