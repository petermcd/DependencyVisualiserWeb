class neo4jDriver{
    constructor(host, port, username, password){
        this.driver = neo4j.v1.driver("bolt://" + host + ":" + port, neo4j.v1.auth.basic(username, password),{encrypted: false});

    }
    prepareMain(){
        const query = 'match (n)-[r]->(m)' +
            'WHERE not(n.name = "php" or m.name = "php")' +
            'return {id: id(n), package: n.vendor + "\\\\" + n.name, name: n.name, vendor: n.vendor, url: n.url, version: n.version, type:head(labels(n)), size:size((n)<--())} as source,' +
            '{id: id(r), version: r.version, for: r.for, size: size(()-[]->()<-[r]-())} as relationships,' +
            '{id: id(m), package: m.vendor + "\\\\" + m.name, name: m.name, vendor: m.vendor, url: m.url, version: m.version, type:head(labels(m)), size:size((m)<--())} as target';
        this.session = this.driver.session();
        this.query = query;
    }
    preparePackagePath(vendor, packageName){
        const query = 'MATCH p=(start)-[rel:Requires*1..10]->(end) WHERE head(labels(start)) = "Project" AND end.vendor = "' + vendor + '" AND end.name = "' + packageName + '" ' +
            'WITH NODES(p) AS nodes ' +
            'UNWIND nodes AS n ' +
            'UNWIND nodes AS m ' +
            'MATCH path = (n)-[r]->(m) ' +
            'return {id: id(n), package: n.vendor + "\\\\" + n.name, name: n.name, vendor: n.vendor, url: n.url, version: n.version, type:head(labels(n)), size:size((n)<--())} as source, ' +
            '{id: id(r), version: r.version, for: r.for, size: size(()-[]->()<-[r]-())} as relationships, ' +
            '{id: id(m), package: m.vendor + "\\\\" + m.name, name: m.name, vendor: m.vendor, url: m.url, version: m.version, type:head(labels(m)), size:size((m)<--())} as target ';
        this.session = this.driver.session();
        this.query = query;
    }
    run(){
        return this.session.run(this.query, {limit: 5000})
    }
    close(){
        this.session.close();
    }
}