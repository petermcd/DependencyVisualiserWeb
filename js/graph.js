class graph{
    constructor(url, elementId){
        this.initialised = false;
        this.url = url;
        this.element = elementId;
        this.nodes = [];
        this.links = [];
        $("#package-list").change(function () {
            this.packageChanged();
        }.bind(this));
        this.getGraphData('', '');
    }
    getGraphData(vendor, name){
        let nodes = [];
        let links = [];
        if((vendor.length === 0 || name.length === 0) && this.nodes.length > 0){
            nodes = this.nodes;
            links = this.links;
            if((vendor.length === 0 || name.length === 0) && this.nodes.length === 0){
                this.nodes = nodes;
                this.links = links;
            }
            const gData = {nodes: Object.values(nodes), links: links};
            this.createGraph(gData);
        } else {
            let parameters = {};
            if(vendor.length > 0 && name.length > 0){
                parameters = {vendor: vendor, name: name};
            }
            $.ajax({
                url: this.url,
                method: "GET",
                data: parameters,
                dataType: 'application/json',
                accepts: {
                    json: 'application/json'
                }
            }).done(function(data){
                const tData = this.prepareData(data);
                const gData = {nodes: Object.values(tData.nodes), links: tData.links};
                this.createGraph(gData);
            }.bind(this)).fail(function () {
                alert('request failed');
            });
        }
    }
    prepareData(data){
        let gData = JSON.parse(data);
        const links = gData.map(r => {
            let source = r.source;
            nodes[source.id] = source;
            let target = r.target;
            nodes[target.id] = target;
            let rel = r.relationship;
            return Object.assign({source: source.id, target: target.id}, rel);
        });
        return {data: gData, links: links}
    }
    createGraph(data){
        const elem = document.getElementById(this.element);
        $('#' + this.element).html('');
        const gData = data;
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
            .linkWidth(link => `${link.size}`)
            .linkDirectionalArrowLength(3.5)
            .linkDirectionalArrowRelPos(1)
            .linkAutoColorBy('type')
            .linkLabel(link => `Version: ${link.version}<br>Platform: ${link.for}`);
        if (!this.initialised){
            this.initialised = true;
            this.populateNodeList();
        }
    }
    populateNodeList(){
        let nodeOrdered = [];
        $.each(this.nodes, function(key, value){
            if (value === undefined) {
                return;
            }
            nodeOrdered.push(value);
        });
        nodeOrdered.sort(function(nodeA, nodeB){
            let packageA = nodeA.vendor + '\\' + nodeA.name;
            let packageB = nodeB.vendor + '\\' + nodeB.name;
            if(packageA > packageB){
                return 1;
            }
            return -1;
        });

        $.each(nodeOrdered, function(index, value){
            $("#package-list").append("<option value='" + value.id + "'>" + value.vendor + '\\' + value.name + "</option>");
        });
    }
    nodeClicked(node){
        $("#package-list").val(node.id);
        this.packageChanged();
    }
    packageChanged(){
        alert('triggered');
        let id = $("#package-list").val();
        let vendorText = '';
        let urlText = '';
        let versionText = '';
        let nameText = '';
        let packageText = '';
        if(id !== 'Select'){
            nameText = this.nodes[id].name;
            vendorText = this.nodes[id].vendor;
            packageText = vendorText + '\\' + nameText;
            urlText = '<a href="' + this.nodes[id].url + '">' + this.nodes[id].url + '</a>';
            versionText = this.nodes[id].version;
        }
        $("#package").text(packageText);
        $("#vendor").text(vendorText);
        $("#url").html(urlText);
        $("#version").text(versionText);
        this.getGraphData(vendorText, nameText);
    }
    focusOnNode(){
        let { nodes, } = this.graph.graphData();
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