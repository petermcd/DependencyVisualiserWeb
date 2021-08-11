"use strict";
class graph{
    constructor(url, elementId){
        this.url = url;
        this.elementId = elementId;
        this.nodes = null;
        this.links = null;
        this.graph = null;
        $("#package-list").change(function () {
            this.packageChanged();
        }.bind(this));
        this.createGraph();
    }
    createGraph(vendor = '', packageName = ''){
        if (this.nodes != null && vendor.length === 0 && packageName.length === 0)
        {
            this.drawGraph({nodes: Object.values(this.nodes), links: this.links});
        } else {
            let parameters = {};
            if(vendor.length > 0 && packageName.length > 0){
                parameters = {vendor: vendor, package: packageName};
            }
            $.ajax({
                url: this.url,
                method: "GET",
                data: parameters,
                context: this,
                accepts: {
                    json: 'application/json'
                }
            }).done(function(data){
                let graphData = this.prepareData(data);
                this.drawGraph(graphData);
            }.bind(this)).fail(function( jqXHR, textStatus, errorThrown ) {
                alert(errorThrown);
            });
        }
    }
    prepareData(data){
        let nodes = {};
        const links = data.map(r => {
            let source = r.source;
            nodes[source.id] = source;
            let target = r.target;
            nodes[target.id] = target;
            let rel = r.relationship;
            return Object.assign({source: source.id, target: target.id}, rel);
        });
        if(this.nodes === null){
            this.nodes = nodes;
            this.links = links;
            this.populateNodeList();
        }
        return {nodes: Object.values(nodes), links: links};
    }
    drawGraph(graphData){
        const elem = document.getElementById(this.elementId);
        $('#' + this.elementId).html('');
        this.graph = ForceGraph3D()(elem)
            .width(document.getElementById('graph').offsetWidth)
            .height(document.getElementById('graph').offsetHeight)
            .graphData(graphData)
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
            if (packageA < packageB){
                return -1;
            }
            return 0;
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
        this.createGraph(vendorText, nameText);
    }
}
