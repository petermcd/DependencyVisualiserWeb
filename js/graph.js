class graph{
    constructor(driver, elementId){
        this.driver = driver;
        this.element = elementId;
        this.nodes = {};
    }
    create() {
        this.nodes = {};
        $('#' + this.element).html('');
        $("#package-list").change(function () {
            this.packageChanged();
        }.bind(this));
        const elem = document.getElementById(this.element);
        this.driver.prepareMain();
        this.driver
            .run()
            .then(
                function (result) {
                    //const nodes = {};
                    const links = result.records.map(r => {
                        let source = r.get('source');
                        source.id = source.id.toNumber();
                        this.nodes[source.id] = source;
                        let target = r.get('target');
                        target.id = target.id.toNumber();
                        this.nodes[target.id] = target;
                        let rel = r.get('relationship');
                        return Object.assign({source: source.id, target: target.id}, rel);
                    });
                    const gData = {nodes: Object.values(this.nodes), links: links};
                    // FIXME width and height should be configured at the point of creation
                    this.graph = null;
                    this.graph = ForceGraph3D()(elem)
                        .width(document.getElementById('graph').offsetWidth)
                        .height(document.getElementById('graph').offsetHeight)
                        .graphData(gData)
                        .nodeAutoColorBy('type')
                        .nodeVal('size')
                        .nodeRelSize(3)
                        .nodeThreeObject(node => {
                            const obj = new THREE.Mesh(
                                new THREE.SphereGeometry(10),
                                new THREE.MeshBasicMaterial({depthWrite: false, transparent: true, opacity: 0})
                            );
                            const sprite = new SpriteText(`${node.name}`);
                            sprite.color = node.color;
                            sprite.textHeight = 5;
                            obj.add(sprite);
                            return obj;
                        })
                        .nodeLabel(node => `Package: ${node.vendor}\\${node.name}<br>Version: ${node.version}`)
                        .onNodeClick(function (node) {
                            this.nodeClicked(node);
                        }.bind(this))
                        .onNodeHover(node => elem.style.cursor = node ? 'pointer' : null)
                        .linkThreeObjectExtend(true)
                        //FIXME below code skews the image
                        /*.linkThreeObject(link => {
                            const sprite = new SpriteText(`${link.version}`);
                            sprite.color = 'lightgrey';
                            sprite.textHeight = 5;
                            return sprite;
                        })
                        .linkPositionUpdate(
                            (sprite, {start, end}) => {
                                const middlePos = Object.assign(...['x', 'y', 'z'].map(c => (
                                    {
                                        [c]: start[c] + (end[c] - start[c]) / 2
                                    }
                                )));
                                Object.assign(sprite.position, middlePos);
                            })*/
                        .linkWidth(link => `${link.size}`)
                        .linkDirectionalArrowLength(3.5)
                        .linkDirectionalArrowRelPos(1)
                        .linkAutoColorBy('type')
                        .linkLabel(link => `Version: ${link.version}<br>Platform: ${link.for}`);
                    this.outputNodeList();
                }.bind(this))
            .catch(function (error) {
                console.log(error);
            });
        this.driver.close();
    }
    createPath(vendor, packageName) {
        let pathnodes = {};
        $('#' + this.element).html('');
        const elem = document.getElementById(this.element);
        this.driver.preparePackagePath(vendor, packageName);
        this.driver
            .run()
            .then(
                function (result) {
                    //const nodes = {};
                    const links = result.records.map(r => {
                        let source = r.get('source');
                        source.id = source.id.toNumber();
                        pathnodes[source.id] = source;
                        let target = r.get('target');
                        target.id = target.id.toNumber();
                        pathnodes[target.id] = target;
                        let rel = r.get('relationship');
                        return Object.assign({source: source.id, target: target.id}, rel);
                    });
                    const gData = {nodes: Object.values(pathnodes), links: links};
                    this.graph = ForceGraph3D()(elem)
                        .width(document.getElementById('graph').offsetWidth)
                        .height(document.getElementById('graph').offsetHeight)
                        .graphData(gData)
                        .nodeAutoColorBy('type')
                        .nodeVal('size')
                        .nodeRelSize(3)
                        .nodeThreeObject(node => {
                            const obj = new THREE.Mesh(
                                new THREE.SphereGeometry(10),
                                new THREE.MeshBasicMaterial({depthWrite: false, transparent: true, opacity: 0})
                            );
                            const sprite = new SpriteText(`${node.name}`);
                            sprite.color = node.color;
                            sprite.textHeight = 5;
                            obj.add(sprite);
                            return obj;
                        })
                        .nodeLabel(node => `Package: ${node.vendor}\\${node.name}<br>Version: ${node.version}`)
                        .onNodeClick(function (node) {
                            this.nodeClicked(node);
                        }.bind(this))
                        .onNodeHover(node => elem.style.cursor = node ? 'pointer' : null)
                        .linkThreeObjectExtend(true)
                        .linkWidth(link => `${link.size}`)
                        .linkDirectionalArrowLength(3.5)
                        .linkDirectionalArrowRelPos(1)
                        .linkAutoColorBy('type')
                        .linkLabel(link => `Version: ${link.version}<br>Platform: ${link.for}`);
                }.bind(this))
            .catch(function (error) {
                console.log(error);
            });
        this.driver.close();
    }
    outputNodeList(){
        let nodeOrdered = [];
        $.each(this.nodes, function(key, value){
            nodeOrdered.push({id: key, node: value});
        });
        nodeOrdered.sort(function(nodeA, nodeB){
            let packageA = nodeA.node.vendor + '\\' + nodeA.node.name;
            let packageB = nodeB.node.vendor + '\\' + nodeB.node.name;
            if(packageA > packageB){
                return 1;
            }
            return -1;
        });

        $.each(nodeOrdered, function(index, value){
            $("#package-list").append("<option value='" + value.id + "'>" + value.node.vendor + '\\' + value.node.name + "</option>");
        });
    }
    nodeClicked(node){
        $("#package-list").val(node.id);
        this.packageChanged();
    }
    packageChanged(){
        let id = $("#package-list").val();
        if(id == 'Select'){
            this.create();
            $("#package").text();
            $("#vendor").text();
            $("#url").text();
            $("#version").text();
            return;
        }

        $("#package").text(this.nodes[id].vendor + '\\' + this.nodes[id].name);
        $("#vendor").text(this.nodes[id].vendor);
        $("#url").html('<a href="' + this.nodes[id].url + '">' + this.nodes[id].url + '</a>');
        $("#version").text(this.nodes[id].version);
        this.createPath(this.nodes[id].vendor, this.nodes[id].name);
    }
    focusOnNode(){
        let { nodes, links } = this.graph.graphData();
        this.graph.cameraPosition(
            {
                x: nodes[id].__threeObj.position.x,
                y: nodes[id].__threeObj.position.y,
                z: nodes[id].__threeObj.position.z - 200
            },
            {
                x: nodes[id].__threeObj.position.x,
                y: nodes[id].__threeObj.position.y,
                z: nodes[id].__threeObj.position.z
            },
            10
        );
    }
}
