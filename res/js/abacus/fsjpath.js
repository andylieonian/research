/**
 * Foresee High Speed Json-Path
 */
function FSjpath(){
    this.formData;
    this.kvs;
    this.idxReversePath; // {lastNodeOfPath1: [kv1, kv2, ...], lastNodeOfPath2: [kv3, kv4, ...]}
    this.deep = 0;
    if (typeof FSjpath.prototype._inited == "undefined") {
        FSjpath.prototype.initialize = function(rootJsonObj){
            this.kvs = [];
            this.idxReversePath = {};
            this.formData = rootJsonObj;
            this.initKV(this.formData);
        }
        FSjpath.prototype.query = function(jpath, count){
            var rets = [];
            var paths = this.paths(jpath);
            for (var i = 0; i < paths.length; i++) {
                rets.push(this.valueOf(paths[i]));
            }
            return rets;
        }
        FSjpath.prototype.valueOf = function(path){
            if (path.indexOf("[*]") > 0) {
                //TODO:
            } else if (path.indexOf("[#]") > 0) {
                //TODO:
            } else {
                var base = this.formData;
                path.replace(/\[([\w]+)\]/g, function($1, $2){
                    base = base[$2];
                });
                return base;
            }
        }
        FSjpath.prototype.paths = function(jpath){
            var prefix = (jpath.substr(0, 1) === "$") ? "$" : "";
            var nodepath = this.normalize(jpath);
            var flagAggregation = (nodepath.indexOf("[*]") > 0);
            var flagDynamicParam = (nodepath.indexOf("[#]") > 0);
            var rets = [];
            if (flagAggregation || flagDynamicParam) {
                var idx = [];
                var temp = nodepath;
                temp = temp.replace(/\[([*#\d]+)\]/g, function($1){
                    idx.push($1);
                    return $1;
                });
                temp = temp.replace(/\[[#*]\]/g, "[0]");
                rets = this.seekingPaths(temp, prefix);
                for (var i = 0; i < rets.length; i++) {
                    var t = 0;
                    rets[i] = rets[i].replace(/\[([*#\d]+)\]/g, function($1){
                        return idx[t++];
                    });
                }
            } else {
                // Narrow the scan range
                rets = this.seekingPaths(nodepath, prefix);
            }
            return (rets.length > 0) ? rets : false;
        }
        FSjpath.prototype.seekingPaths = function(nodepath, prefix){
            var rets = [];
            var ln = this.lastNode(nodepath);
            if (ln !== "*" && ln !== "#") {
                var lstSeeking = this.idxReversePath[ln];
                if (!lstSeeking) {
                    this.initialize(this.formData);
                    lstSeeking = this.idxReversePath[ln];
                }
                if (lstSeeking) {
                    //Seeking one by one
                    var length = lstSeeking.length;
                    var reg = this.toRegular(nodepath);
                    for (var i = 0; i < length; i++) {
                        if (reg.test(lstSeeking[i].k)) {
                            rets.push(prefix + lstSeeking[i].k);
                        }
                    }
                } else {
                    var lnn = this.lastNameNode(nodepath);
                    if (lnn.isArray) {
                        var lstSeeking = this.idxReversePath[lnn.node];
                        if (lstSeeking) {
                            var length = lstSeeking.length;
                            var reg = this.toRegular(lnn.path);
                            for (var i = 0; i < length; i++) {
                                if (reg.test(lstSeeking[i].k)) {
                                    rets.push(prefix + lstSeeking[i].k);
                                }
                            }
                            for (var t = 0; t < lnn.idx.length; t++) {
                                rets = rets[lnn.idx[t]];
                            }
                            rets = [ rets ];
                        }
                    } else {
                        rets = jsonPath(this.formData, prefix+nodepath, { resultType : "PATH" })
                    }
                }
            }
            return rets;
        }
        /**
         * <pre>
         * $..[zbGridlbVO][0][qcwjse] 
         * $..[zzssyyybnsr04_bqjxsemxb][bqjxsemxbGrid][bqjxsemxbGridlbVO][0][bqfse]
         * </pre>
         */
        FSjpath.prototype.lastNode = function(nodepath){
            var pos = nodepath.lastIndexOf("[");
            var node = nodepath.substr(pos + 1);
            return node.substr(0, node.length - 1);
        }
        /**
         * <pre>
         * $..[zbGridlbVO][0][qcwjse] 
         * $..[zzssyyybnsr04_bqjxsemxb][bqjxsemxbGrid][bqjxsemxbGridlbVO][0][bqfse]
         * </pre>
         */
        FSjpath.prototype.lastNameNode = function(nodepath){
            var pos = nodepath.lastIndexOf("[");
            var node = nodepath.substr(pos + 1);
            node = node.substr(0, node.length - 1);
            if (isNaN(node)) {
                return { "node" : node, "isArray" : false, "path" : nodepath, "idx" : [] };
            } else {
                var tmp = this.lastNameNode(nodepath.substr(0, pos));
                return { "node" : tmp.node, "isArray" : true, "path" : tmp.path,
                    "idx" : [ node ].concat(tmp.idx) };
            }
        }
        /**
         * @param nodepath String. Normalized jpath.
         */
        FSjpath.prototype.toRegular = function(nodepath){
            var ret = nodepath;
            ret = ret.replace(/\[/g, "\\[").replace(/\]/g, "\\]");
            ret = ret.replace(/\.\./g, ".*").replace(/[$]/, "");
            return new RegExp(ret, "");
        }
        /**
         * <pre>
         * $..nsrjbxx.nsrmc => $..[nsrjbxx][nsrmc]
         * $..zbGridlbVO[0].xxse => $..[zbGridlbVO][0][xxse]
         * $..bqjxsemxbGridlbVO[*].qcye => $..[bqjxsemxbGridlbVO][*][qcye]
         * $..zzsjmssbmxbjsxmGridlbVO[#].qmye => $..[zzsjmssbmxbjsxmGridlbVO][#][qmye]
         * $.qcs..frmx => $[qcs]..[frmx]
         * $.qcs..szhd[0].zspmDm => $[qcs]..[szhd][0][zspmDm]
         * </pre>
         */
        FSjpath.prototype.normalize = function(jpath){
            var subx = [];
            var ret = jpath;
            var log = ret;
            ret = ret.replace(/'?\.'?|\['?/g, ";");
            ret = ret.replace(/;;;|;;/g, ";..;");
            log += " => " + ret;
            ret = ret.replace(/;$|'?\]|'$/g, "");
            ret = ret.replace(/;/g, "][");
            log += " => " + ret;
            ret = ret.replace(/\$]/g, "$") + "]";
            ret = ret.replace(/\[\.\.\]/g, "..");
            log += " => " + ret;
            //console.log(log);
            return ret;
        }
        FSjpath.prototype.initKV = function(obj, prefix, name){
            if ("string" !== typeof prefix) {
                prefix = "";
            }
            if (obj instanceof Array) {
                for (var i = 0; i < obj.length; i++) {
                    this.initKV(obj[i], prefix + "[" + i + "]", i);
                }
            } else if ("function" === typeof obj) {
                // Skip function.
            } else if ("object" == typeof obj) {
                var cnt = 0;
                for ( var n in obj) {
                    cnt++;
                    this.initKV(obj[n], prefix + "[" + n + "]", n);
                }
                if (cnt == 0) {
                    this.addToKV(prefix, obj, name);
                }
            } else {
                this.addToKV(prefix, obj, name);
            }
        }
        FSjpath.prototype.addToKV = function(k, v, n){
            var tmp = { "k" : k, "v" : v };
            this.kvs.push(tmp);
            if (!this.idxReversePath[n]) {
                this.idxReversePath[n] = [];
            };
            this.idxReversePath[n].push(tmp);
        }
    }
    // For not to do initialization twice.
    FSjpath.prototype._inited == true;
}
