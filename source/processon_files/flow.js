// 全局变量管理
window.globalVariables = {
    variables: {},
    
    // 添加全局变量
    addVariable(name, value) {
        this.variables[name] = value;
        // 保存到localStorage
        localStorage.setItem('flowGlobalVariables', JSON.stringify(this.variables));
        // 渲染变量列表
        renderVarList();
        // 更新条件节点的变量选择框
        updateConditionVarSelect();
    },
    
    // 获取全局变量
    getVariable(name) {
        return this.variables[name];
    },
    
    // 更新全局变量
    updateVariable(name, value) {
        if (this.variables.hasOwnProperty(name)) {
            this.variables[name] = value;
            // 保存到localStorage
            localStorage.setItem('flowGlobalVariables', JSON.stringify(this.variables));
            // 渲染变量列表
            renderVarList();
            // 更新条件节点的变量选择框
            updateConditionVarSelect();
        }
    },
    
    // 删除全局变量
    deleteVariable(name) {
        delete this.variables[name];
        // 保存到localStorage
        localStorage.setItem('flowGlobalVariables', JSON.stringify(this.variables));
        // 渲染变量列表
        renderVarList();
        // 更新条件节点的变量选择框
        updateConditionVarSelect();
    },
    
    // 清空所有全局变量
    clearVariables() {
        this.variables = {};
    }
};

// 初始化全局变量
function initGlobalVars() {
    // 从localStorage加载全局变量
    var vars = localStorage.getItem('flowGlobalVariables');
    if (vars) {
        globalVariables.variables = JSON.parse(vars);
    }
    // 渲染变量列表
    renderVarList();
}

// 渲染全局变量列表
function renderVarList() {
    var varList = document.getElementById('varListBody');
    varList.innerHTML = '';
    for (var key in globalVariables.variables) {
        if (globalVariables.variables.hasOwnProperty(key)) {
            var tr = document.createElement('tr');
            tr.innerHTML = '<td>' + key + '</td><td>' + globalVariables.variables[key] + '</td>';
            varList.appendChild(tr);
        }
    }
}

// 更新条件节点的变量选择框
function updateConditionVarSelect() {
    var selects = document.querySelectorAll('.condition-var-select');
    selects.forEach(function(select) {
        // 清空选择框
        select.innerHTML = '<option value="">请选择变量</option>';
        // 添加全局变量
        for (var key in globalVariables.variables) {
            if (globalVariables.variables.hasOwnProperty(key)) {
                var option = document.createElement('option');
                option.value = key;
                option.textContent = key + ' = ' + globalVariables.variables[key];
                select.appendChild(option);
            }
        }
        });
}

// 打开全局变量管理弹窗
function showGlobalVars() {
    // 初始化全局变量
    initGlobalVars();
    // 打开弹窗
    console.log('打开全局变量管理弹窗');
    var varName = prompt('请输入变量名');
    if (varName) {
        var varValue = prompt('请输入变量值');
        if (varValue) {
            globalVariables.addVariable(varName, varValue);
        }
    }
}

// 表达式计算
function evaluateExpression(expression) {
    try {
        // 替换全局变量
        var exp = expression.replace(/\${global\.([^}]+)}/g, function(match, key) {
            return globalVariables.variables.hasOwnProperty(key) ? globalVariables.variables[key] : match;
        });
        // 计算表达式
        return eval(exp);
    } catch (e) {
        console.error('表达式计算错误:', e);
        return false;
    }
}

// 执行流程
function executeFlow() {
    // 获取所有节点
    var nodes = Model.define.elements;
    if (!nodes || nodes.length === 0) {
        console.log('没有可执行的节点');
        return;
    }
    // 遍历节点并执行
    nodes.forEach(function(node) {
        if (node.type === 'control') {
            // 条件节点
            var condition = node.data.condition;
            if (!condition) {
                console.log('条件节点', node.id, '没有设置条件');
                return;
            }
            // 计算条件表达式
            var result = evaluateExpression(condition);
            console.log('条件节点', node.id, '条件:', condition, '结果:', result);
            // 根据结果执行不同分支
            if (result) {
                console.log('执行条件节点', node.id, '的真分支');
            } else {
                console.log('执行条件节点', node.id, '的假分支');
            }
        } else {
            // 普通节点
            console.log('执行普通节点', node.id, '类型:', node.type);
        }
    });
}

// 添加全局变量（兼容旧接口）
function addGlobalVariable(name, value) {
    globalVariables.addVariable(name, value);
}

// 更新全局变量（兼容旧接口）
function updateGlobalVariable(name, value) {
    globalVariables.updateVariable(name, value);
}

// 删除全局变量（兼容旧接口）
function deleteGlobalVariable(name) {
    globalVariables.deleteVariable(name);
}

// 模型定义
var Model = {
    define: {
        elements: [],
        connections: []
    }
};

// 初始化函数
function init() {
    // 初始化全局变量
    initGlobalVars();
    
    // 绑定事件
    document.getElementById('add_node').addEventListener('click', function() {
        // 打开节点类型选择弹窗
        layer.open({
            type: 1,
            title: '选择节点类型',
            content: '<div class="layui-form">' +
                '<div class="layui-form-item">' +
                '<label class="layui-form-label">节点类型</label>' +
                '<div class="layui-input-block">' +
                '<select name="nodeType" lay-verify="required">' +
                '<option value="">请选择节点类型</option>' +
                '<option value="process">流程节点</option>' +
                '<option value="control">条件节点</option>' +
                '<option value="terminator">开始/结束节点</option>' +
                '</select>' +
                '</div>' +
                '</div>' +
                '</div>',
            area: ['300px', '200px'],
            btn: ['确定', '取消'],
            yes: function(index, layero) {
                var type = layero.find('select[name="nodeType"]').val();
                if (type) {
                    addNode(type);
                    layer.close(index);
                }
            }
        });
    });
    
    document.getElementById('delete_node').addEventListener('click', function() {
        // 打开确认弹窗
        layer.confirm('确定要删除选中的节点吗？', function(index) {
            // 删除选中的节点
            var selectedNodes = document.querySelectorAll('.flow-node.selected');
            selectedNodes.forEach(function(node) {
                var id = node.id.replace('node-', '');
                deleteNode(id);
            });
            layer.close(index);
        });
    });
    
    document.getElementById('edit_node').addEventListener('click', function() {
        // 打开选中节点的配置
        var selectedNodes = document.querySelectorAll('.flow-node.selected');
        if (selectedNodes.length === 1) {
            var id = selectedNodes[0].id.replace('node-', '');
            editNode(id);
        } else if (selectedNodes.length > 1) {
            console.log('只能编辑一个节点');
        } else {
            console.log('请先选择一个节点');
        }
    });
    
    document.getElementById('save_flow').addEventListener('click', saveFlow);
    document.getElementById('load_flow').addEventListener('click', loadFlow);
    document.getElementById('dock_btn_add').addEventListener('click', function() {
        // 打开节点类型选择弹窗
        layer.open({
            type: 1,
            title: '选择节点类型',
            content: '<div class="layui-form">' +
                '<div class="layui-form-item">' +
                '<label class="layui-form-label">节点类型</label>' +
                '<div class="layui-input-block">' +
                '<select name="nodeType" lay-verify="required">' +
                '<option value="">请选择节点类型</option>' +
                '<option value="process">流程节点</option>' +
                '<option value="control">条件节点</option>' +
                '<option value="terminator">开始/结束节点</option>' +
                '</select>' +
                '</div>' +
                '</div>' +
                '</div>',
            area: ['300px', '200px'],
            btn: ['确定', '取消'],
            yes: function(index, layero) {
                var type = layero.find('select[name="nodeType"]').val();
                if (type) {
                    addNode(type);
                    layer.close(index);
                }
            }
        });
    });
    
    document.getElementById('dock_btn_edit').addEventListener('click', function() {
        // 打开选中节点的配置
        var selectedNodes = document.querySelectorAll('.flow-node.selected');
        if (selectedNodes.length === 1) {
            var id = selectedNodes[0].id.replace('node-', '');
            editNode(id);
        } else if (selectedNodes.length > 1) {
            console.log('只能编辑一个节点');
        } else {
            console.log('请先选择一个节点');
        }
    });
    
    document.getElementById('dock_btn_delete').addEventListener('click', function() {
        // 打开确认弹窗
        layer.confirm('确定要删除选中的节点吗？', function(index) {
            // 删除选中的节点
            var selectedNodes = document.querySelectorAll('.flow-node.selected');
            selectedNodes.forEach(function(node) {
                var id = node.id.replace('node-', '');
                deleteNode(id);
            });
            layer.close(index);
        });
    });
    
    document.getElementById('dock_btn_global_vars').addEventListener('click', showGlobalVars);
    document.getElementById('dock_btn_execute').addEventListener('click', executeFlow);
}

// 添加节点
function addNode(type) {
    const node = {
        id: `node-${Date.now()}`,
        type: type,
        name: `${type}节点`,
        x: 100,
        y: 100,
        width: 120,
        height: 60
    };
    NodeManager.addNode(node);
    renderNode(node);
}

// 渲染节点
function renderNode(node) {
    const container = document.getElementById('flow_container');
    const nodeElement = document.createElement('div');
    nodeElement.id = node.id;
    nodeElement.className = `flow-node ${node.type}`;
    nodeElement.style.left = `${node.x}px`;
    nodeElement.style.top = `${node.y}px`;
    nodeElement.style.width = `${node.width}px`;
    nodeElement.style.height = `${node.height}px`;
    nodeElement.innerHTML = `
        <div class="flow-node-title">${node.name}</div>
        <div class="flow-node-content">${node.type}</div>
    `;
    container.appendChild(nodeElement);
    
    // 添加拖拽功能
    $(nodeElement).draggable({
        drag: function(event, ui) {
            node.x = ui.position.left;
            node.y = ui.position.top;
        }
    });
}

// 删除节点
function deleteNode(id) {
    NodeManager.deleteNode(id);
    const nodeElement = document.getElementById(id);
    if (nodeElement) {
        nodeElement.remove();
    }
}

// 编辑节点
function editNode(id) {
    const node = NodeManager.getNode(id);
    if (node) {
        layer.open({
            type: 1,
            title: '编辑节点',
            content: `
                <div class="layui-form">
                    <div class="layui-form-item">
                        <label class="layui-form-label">节点名称</label>
                        <div class="layui-input-block">
                            <input type="text" name="name" value="${node.name}" required lay-verify="required" placeholder="请输入节点名称" autocomplete="off" class="layui-input">
                        </div>
                    </div>
                    <div class="layui-form-item">
                        <label class="layui-form-label">节点类型</label>
                        <div class="layui-input-block">
                            <input type="text" name="type" value="${node.type}" disabled class="layui-input">
                        </div>
                    </div>
                </div>
            `,
            area: ['400px', '200px'],
            btn: ['确定', '取消'],
            yes: function(index, layero) {
                const name = layero.find('input[name="name"]').val();
                if (name) {
                    node.name = name;
                    NodeManager.updateNode(id, node);
                    const nodeElement = document.getElementById(id);
                    if (nodeElement) {
                        nodeElement.querySelector('.flow-node-title').textContent = name;
                    }
                    layer.close(index);
                }
            }
        });
    }
}

// 显示全局变量
function showGlobalVars() {
    console.log('打开全局变量管理弹窗');
    var varName = prompt('请输入变量名');
    if (varName) {
        var varValue = prompt('请输入变量值');
        if (varValue) {
            globalVariables.addVariable(varName, varValue);
        }
    }
}

// 执行流程
function executeFlow() {
    const nodes = NodeManager.nodes;
    if (nodes.length === 0) {
        console.log('没有可执行的节点');
        return;
    }
    
    // 查找开始节点
    const startNode = nodes.find(node => node.type === 'start');
    if (!startNode) {
        console.log('找不到开始节点');
        return;
    }
    
    // 执行开始节点
    FlowExecutor.startFlow(startNode.id);
}

// 添加全局变量
function addGlobalVariable(name, value) {
    globalVariables.addVariable(name, value);
    console.log('全局变量已添加');
}

// 更新全局变量
function updateGlobalVariable(name, value) {
    globalVariables.updateVariable(name, value);
    console.log('全局变量已更新');
}

// 删除全局变量
function deleteGlobalVariable(name) {
    globalVariables.deleteVariable(name);
    console.log('全局变量已删除');
}

// 初始化函数
function init() {
    // 检查jQuery是否加载
    if (typeof $ === 'undefined') {
        setTimeout(init, 100);
        return;
    }
    
    // 初始化全局变量
    initGlobalVars();
    // 监听添加节点按钮
    document.getElementById('add_node').addEventListener('click', function() {
        const type = prompt('请输入节点类型（process/control/terminator）');
        if (type) {
            addNode(type);
        }
    });
    // 监听删除节点按钮
    document.getElementById('delete_node').addEventListener('click', function() {
        const selectedNodes = document.querySelectorAll('.flow-node.selected');
        if (selectedNodes.length > 0) {
            const confirmDelete = confirm('确定要删除选中的节点吗？');
            if (confirmDelete) {
                selectedNodes.forEach(function(node) {
                    const id = node.id;
                    deleteNode(id);
                });
            }
        } else {
            console.log('请先选择一个节点');
        }
    });
    // 监听编辑节点按钮
    document.getElementById('edit_node').addEventListener('click', function() {
        const selectedNodes = document.querySelectorAll('.flow-node.selected');
        if (selectedNodes.length === 1) {
            const id = selectedNodes[0].id;
            editNode(id);
        } else if (selectedNodes.length > 1) {
            console.log('只能编辑一个节点');
        } else {
            console.log('请先选择一个节点');
        }
        });
        
        // 监听保存流程按钮
        document.getElementById('save_flow').addEventListener('click', function() {
            saveFlow();
        });
        
        // 监听加载流程按钮
        document.getElementById('load_flow').addEventListener('click', function() {
            loadFlow();
        });
        
        // 监听全局变量按钮
        document.getElementById('dock_btn_global_vars').addEventListener('click', function() {
            showGlobalVars();
        });
        
        // 监听执行流程按钮
        document.getElementById('dock_btn_execute').addEventListener('click', function() {
            executeFlow();
        });
}

// 页面加载完成后初始化
window.onload = init;

// 表达式计算工具
const ExpressionEvaluator = {
    // 计算表达式
    evaluate(expression, context = {}) {
        try {
            // 合并全局变量和上下文
            const fullContext = { ...globalVariables.variables, ...context };
            
            // 创建变量字符串
            const variables = Object.keys(fullContext).map(key => `const ${key} = ${JSON.stringify(fullContext[key])};`).join('\n');
            
            // 执行表达式
            const result = eval(`(function() {${variables} return ${expression};})()`);
            
            return result;
        } catch (error) {
            console.error('表达式计算错误:', error);
            return false;
        }
    }
};

// 节点管理
const NodeManager = {
    nodes: [],
    
    // 添加节点
    addNode(node) {
        node.id = `node-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        this.nodes.push(node);
        return node;
    },
    
    // 获取节点
    getNode(id) {
        return this.nodes.find(node => node.id === id);
    },
    
    // 更新节点
    updateNode(id, updates) {
        const index = this.nodes.findIndex(node => node.id === id);
        if (index !== -1) {
            this.nodes[index] = { ...this.nodes[index], ...updates };
            return this.nodes[index];
        }
        return null;
    },
    
    // 删除节点
    deleteNode(id) {
        const index = this.nodes.findIndex(node => node.id === id);
        if (index !== -1) {
            return this.nodes.splice(index, 1)[0];
        }
        return null;
    },
    
    // 清空所有节点
    clearNodes() {
        this.nodes = [];
    }
};

// 流程执行
const FlowExecutor = {
    currentNode: null,
    
    // 开始流程
    startFlow(startNodeId) {
        const startNode = NodeManager.getNode(startNodeId);
        if (!startNode) {
            console.error('找不到起始节点');
            return;
        }
        
        this.currentNode = startNode;
        this.executeNode(startNode);
    },
    
    // 执行节点
    executeNode(node) {
        console.log('执行节点:', node.name);
        
        // 根据节点类型执行不同逻辑
        switch (node.type) {
            case 'start':
                this.executeNextNode(node);
                break;
            case 'end':
                console.log('流程结束');
                break;
            case 'process':
                this.processNode(node);
                break;
            case 'decision':
                this.decisionNode(node);
                break;
            default:
                console.error('未知节点类型:', node.type);
                break;
        }
    },
    
    // 处理流程节点
    processNode(node) {
        // 执行节点逻辑
        if (node.handler) {
            try {
                node.handler(node);
            } catch (error) {
                console.error('节点处理函数执行错误:', error);
            }
        }
        
        this.executeNextNode(node);
    },
    
    // 处理决策节点
    decisionNode(node) {
        if (!node.expression) {
            console.error('决策节点没有表达式');
            return;
        }
        
        const result = ExpressionEvaluator.evaluate(node.expression, node.context);
        const nextNodeId = result ? node.trueBranch : node.falseBranch;
        
        if (nextNodeId) {
            const nextNode = NodeManager.getNode(nextNodeId);
            if (nextNode) {
                this.currentNode = nextNode;
                this.executeNode(nextNode);
            } else {
                console.error('找不到下一个节点:', nextNodeId);
            }
        } else {
            console.error('决策节点没有分支');
        }
    },
    
    // 执行下一个节点
    executeNextNode(node) {
        if (node.nextNodeId) {
            const nextNode = NodeManager.getNode(node.nextNodeId);
            if (nextNode) {
                this.currentNode = nextNode;
                this.executeNode(nextNode);
            } else {
                console.error('找不到下一个节点:', node.nextNodeId);
            }
        } else {
            console.log('节点没有下一个节点');
        }
    }
};

// 保存流程
function saveFlow() {
    const flow = {
        nodes: NodeManager.nodes,
        connections: []
    };
    const flowJson = JSON.stringify(flow);
    localStorage.setItem('flow', flowJson);
    console.log('流程已保存');
}

// 加载流程
function loadFlow() {
    const flowJson = localStorage.getItem('flow');
    if (flowJson) {
        const flow = JSON.parse(flowJson);
        NodeManager.clearNodes();
        flow.nodes.forEach(node => NodeManager.addNode(node));
        console.log('流程已加载');
    } else {
        console.log('没有找到保存的流程');
    }
}





// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        globalVariables,
        ExpressionEvaluator,
        NodeManager,
        FlowExecutor,
        saveFlow
    };
}