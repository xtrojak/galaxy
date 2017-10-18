"use strict";function _interopRequireDefault(t){return t&&t.__esModule?t:{default:t}}Object.defineProperty(exports,"__esModule",{value:!0});var _uiModal=require("mvc/ui/ui-modal"),_uiModal2=_interopRequireDefault(_uiModal),_uiFrames=require("mvc/ui/ui-frames"),_uiFrames2=_interopRequireDefault(_uiFrames),_iconButton=require("mvc/ui/icon-button"),_iconButton2=_interopRequireDefault(_iconButton),DatasetMetadata=Backbone.Model.extend({}),Dataset=Backbone.Model.extend({defaults:{id:"",type:"",name:"",hda_ldda:"hda",metadata:null},initialize:function(){this.get("metadata")||this._set_metadata(),this.on("change",this._set_metadata,this)},_set_metadata:function(){var t=new DatasetMetadata;_.each(_.keys(this.attributes),function(e){if(0===e.indexOf("metadata_")){var a=e.split("metadata_")[1];t.set(a,this.attributes[e]),delete this.attributes[e]}},this),this.set("metadata",t,{silent:!0})},get_metadata:function(t){return this.attributes.metadata.get(t)},urlRoot:Galaxy.root+"api/datasets"}),TabularDataset=Dataset.extend({defaults:_.extend({},Dataset.prototype.defaults,{chunk_url:null,first_data_chunk:null,offset:0,at_eof:!1}),initialize:function(t){Dataset.prototype.initialize.call(this),this.attributes.first_data_chunk&&(this.attributes.offset=this.attributes.first_data_chunk.offset),this.attributes.chunk_url=Galaxy.root+"dataset/display?dataset_id="+this.id,this.attributes.url_viz=Galaxy.root+"visualization"},get_next_chunk:function(){if(this.attributes.at_eof)return null;var t=this,e=$.Deferred();return $.getJSON(this.attributes.chunk_url,{offset:t.attributes.offset}).success(function(a){var i;""!==a.ck_data?(i=a,t.attributes.offset=a.offset):(t.attributes.at_eof=!0,i=null),e.resolve(i)}),e}}),DatasetCollection=Backbone.Collection.extend({model:Dataset}),TabularDatasetChunkedView=Backbone.View.extend({initialize:function(t){this.row_count=0,this.loading_chunk=!1,new TabularButtonTracksterView({model:t.model,$el:this.$el})},expand_to_container:function(){this.$el.height()<this.scroll_elt.height()&&this.attempt_to_fetch()},attempt_to_fetch:function(t){var e=this;!this.loading_chunk&&this.scrolled_to_bottom()&&(this.loading_chunk=!0,this.loading_indicator.show(),$.when(e.model.get_next_chunk()).then(function(t){t&&(e._renderChunk(t),e.loading_chunk=!1),e.loading_indicator.hide(),e.expand_to_container()}))},render:function(){this.loading_indicator=$("<div/>").attr("id","loading_indicator"),this.$el.append(this.loading_indicator);var t=$("<table/>").attr({id:"content_table",cellpadding:0});this.$el.append(t);var e=this.model.get_metadata("column_names"),a=$("<thead/>").appendTo(t),i=$("<tr/>").appendTo(a);if(e)i.append("<th>"+e.join("</th><th>")+"</th>");else for(var n=1;n<=this.model.get_metadata("columns");n++)i.append("<th>"+n+"</th>");var l=this,o=this.model.get("first_data_chunk");o?this._renderChunk(o):$.when(l.model.get_next_chunk()).then(function(t){l._renderChunk(t)}),this.scroll_elt.scroll(function(){l.attempt_to_fetch()})},scrolled_to_bottom:function(){return!1},_renderCell:function(t,e,a){var i=$("<td>").text(t),n=this.model.get_metadata("column_types");return void 0!==a?i.attr("colspan",a).addClass("stringalign"):n&&e<n.length&&("str"!==n[e]&&"list"!==n[e]||i.addClass("stringalign")),i},_renderRow:function(t){var e=t.split("\t"),a=$("<tr>"),i=this.model.get_metadata("columns");return this.row_count%2!=0&&a.addClass("dark_row"),e.length===i?_.each(e,function(t,e){a.append(this._renderCell(t,e))},this):e.length>i?(_.each(e.slice(0,i-1),function(t,e){a.append(this._renderCell(t,e))},this),a.append(this._renderCell(e.slice(i-1).join("\t"),i-1))):1===e.length?a.append(this._renderCell(t,0,i)):(_.each(e,function(t,e){a.append(this._renderCell(t,e))},this),_.each(_.range(i-e.length),function(){a.append($("<td>"))})),this.row_count++,a},_renderChunk:function(t){var e=this.$el.find("table");_.each(t.ck_data.split("\n"),function(t,a){""!==t&&e.append(this._renderRow(t))},this)}}),TopLevelTabularDatasetChunkedView=TabularDatasetChunkedView.extend({initialize:function(t){TabularDatasetChunkedView.prototype.initialize.call(this,t);var e=_.find(this.$el.parents(),function(t){return"auto"===$(t).css("overflow")});e||(e=window),this.scroll_elt=$(e)},scrolled_to_bottom:function(){return this.$el.height()-this.scroll_elt.scrollTop()-this.scroll_elt.height()<=0}}),EmbeddedTabularDatasetChunkedView=TabularDatasetChunkedView.extend({initialize:function(t){TabularDatasetChunkedView.prototype.initialize.call(this,t),this.scroll_elt=this.$el.css({position:"relative",overflow:"scroll",height:t.height||"500px"})},scrolled_to_bottom:function(){return this.$el.scrollTop()+this.$el.innerHeight()>=this.el.scrollHeight}}),TabularButtonTracksterView=Backbone.View.extend({col:{chrom:null,start:null,end:null},url_viz:null,dataset_id:null,genome_build:null,file_ext:null,initialize:function(t){var e=parent.Galaxy;if(e&&e.modal&&(this.modal=e.modal),e&&e.frame&&(this.frame=e.frame),this.modal&&this.frame){var a=t.model,i=a.get("metadata");if(a.get("file_ext")){if(this.file_ext=a.get("file_ext"),"bed"==this.file_ext){if(!(i.get("chromCol")&&i.get("startCol")&&i.get("endCol")))return void console.log("TabularButtonTrackster : Bed-file metadata incomplete.");this.col.chrom=i.get("chromCol")-1,this.col.start=i.get("startCol")-1,this.col.end=i.get("endCol")-1}if("vcf"==this.file_ext){var n=function(t,e){for(var a=0;a<e.length;a++)if(e[a].match(t))return a;return-1};if(this.col.chrom=n("Chrom",i.get("column_names")),this.col.start=n("Pos",i.get("column_names")),this.col.end=null,-1==this.col.chrom||-1==this.col.start)return void console.log("TabularButtonTrackster : VCF-file metadata incomplete.")}if(void 0!==this.col.chrom)if(a.id)if(this.dataset_id=a.id,a.get("url_viz")){this.url_viz=a.get("url_viz"),a.get("genome_build")&&(this.genome_build=a.get("genome_build"));var l=new _iconButton2.default.IconButtonView({model:new _iconButton2.default.IconButton({title:"Visualize",icon_class:"chart_curve",id:"btn_viz"})});this.setElement(t.$el),this.$el.append(l.render().$el),this.hide()}else console.log("TabularButtonTrackster : Url for visualization controller is missing.");else console.log("TabularButtonTrackster : Dataset identification is missing.")}}},events:{"mouseover tr":"show",mouseleave:"hide"},show:function(t){var e=this;if(null!==this.col.chrom){var a=$(t.target).parent(),i=a.children().eq(this.col.chrom).html(),n=a.children().eq(this.col.start).html(),l=this.col.end?a.children().eq(this.col.end).html():n;if(!i.match("^#")&&""!==i&&function(t){return!isNaN(parseFloat(t))&&isFinite(t)}(n)){var o={dataset_id:this.dataset_id,gene_region:i+":"+n+"-"+l},s=a.offset(),r=s.left-10,d=s.top-$(window).scrollTop()+3;$("#btn_viz").css({position:"fixed",top:d+"px",left:r+"px"}),$("#btn_viz").off("click"),$("#btn_viz").click(function(){e.frame.add({title:"Trackster",url:e.url_viz+"/trackster?"+$.param(o)})}),$("#btn_viz").show()}else $("#btn_viz").hide()}},hide:function(){this.$("#btn_viz").hide()}}),createModelAndView=function(t,e,a,i){var n=new e({model:new t(a)});return n.render(),i&&i.append(n.$el),n},createTabularDatasetChunkedView=function(t){t.model||(t.model=new TabularDataset(t.dataset_config));var e=t.parent_elt,a=t.embedded;delete t.embedded,delete t.parent_elt,delete t.dataset_config;var i=a?new EmbeddedTabularDatasetChunkedView(t):new TopLevelTabularDatasetChunkedView(t);return i.render(),e&&(e.append(i.$el),i.expand_to_container()),i};exports.default={Dataset:Dataset,TabularDataset:TabularDataset,DatasetCollection:DatasetCollection,TabularDatasetChunkedView:TabularDatasetChunkedView,createTabularDatasetChunkedView:createTabularDatasetChunkedView};
//# sourceMappingURL=../../../maps/mvc/dataset/data.js.map
