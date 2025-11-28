// layui核心库
layui = {
    version: '2.8.16',
    dir: '',
    device: {},
    cache: {},
    define: function(deps, factory) {
        // 模块定义
        if (typeof deps === 'function') {
            factory = deps;
            deps = [];
        }
        layui.cache.modules[deps[0]] = factory;
    },
    use: function(deps, callback) {
        // 模块加载
        var modules = [];
        deps.forEach(function(dep) {
            if (layui.cache.modules[dep]) {
                modules.push(layui.cache.modules[dep]());
            }
        });
        callback.apply(null, modules);
    },
    form: {
        render: function(type) {
            // 渲染表单
            console.log('渲染表单:', type);
        },
        on: function(filter, callback) {
            // 监听表单事件
            console.log('监听表单事件:', filter);
        }
    },
    layer: {
        open: function(options) {
            // 打开弹窗
            console.log('打开弹窗:', options);
            return { index: 1 };
        },
        close: function(index) {
            // 关闭弹窗
            console.log('关闭弹窗:', index);
        },
        msg: function(content) {
            // 提示消息
            console.log('提示消息:', content);
        },
        confirm: function(content, callback) {
            // 确认弹窗
            console.log('确认弹窗:', content);
            callback(1);
        }
    }
};

// 初始化设备检测
layui.device = (function() {
    var device = {};
    var ua = navigator.userAgent;
    device.isMobile = /mobile|android|ios|iphone|ipad|ipod|blackberry|windows phone/.test(ua.toLowerCase());
    device.isAndroid = /android/.test(ua.toLowerCase());
    device.isIOS = /iphone|ipad|ipod/.test(ua.toLowerCase());
    return device;
})();

// 缓存
layui.cache = {
    modules: {},
    files: []
};

// 全局模块
globalThis.layui = layui;