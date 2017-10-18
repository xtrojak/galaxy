"use strict";function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}Object.defineProperty(exports,"__esModule",{value:!0});var _listItem=require("mvc/list/list-item"),_listItem2=_interopRequireDefault(_listItem),_states=require("mvc/dataset/states"),_states2=_interopRequireDefault(_states),_faIconButton=require("ui/fa-icon-button"),_faIconButton2=_interopRequireDefault(_faIconButton),_baseMvc=require("mvc/base-mvc"),_baseMvc2=_interopRequireDefault(_baseMvc),_localization=require("utils/localization"),_localization2=_interopRequireDefault(_localization),logNamespace="dataset",_super=_listItem2.default.ListItemView,DatasetListItemView=_super.extend({_logNamespace:logNamespace,className:_super.prototype.className+" dataset",id:function(){return["dataset",this.model.get("id")].join("-")},initialize:function(e){e.logger&&(this.logger=this.model.logger=e.logger),this.log(this+".initialize:",e),_super.prototype.initialize.call(this,e),this.linkTarget=e.linkTarget||"_blank"},_setUpListeners:function(){_super.prototype._setUpListeners.call(this);var e=this;return e.listenTo(e.model,{change:function(t){e.model.changedAttributes().state&&e.model.inReadyState()&&e.expanded&&!e.model.hasDetails()?e.model.fetch({silent:!0}).done(function(){e.render()}):_.has(t.changed,"tags")&&1===_.keys(t.changed).length?e.$(".nametags").html(e._renderNametags()):e.render()}})},_fetchModelDetails:function(){var e=this;return e.model.inReadyState()&&!e.model.hasDetails()?e.model.fetch({silent:!0}):jQuery.when()},remove:function(e,t){var a=this;e=e||this.fxSpeed,this.$el.fadeOut(e,function(){Backbone.View.prototype.remove.call(a),t&&t.call(a)})},_swapNewRender:function(e){return _super.prototype._swapNewRender.call(this,e),this.model.has("state")&&this.$el.addClass("state-"+this.model.get("state")),this.$el},_renderPrimaryActions:function(){return[this._renderDisplayButton()]},_renderDisplayButton:function(){var e=this.model.get("state");if(e===_states2.default.NOT_VIEWABLE||e===_states2.default.DISCARDED||!this.model.get("accessible"))return null;var t={target:this.linkTarget,classes:"display-btn"};if(this.model.get("purged"))t.disabled=!0,t.title=(0,_localization2.default)("Cannot display datasets removed from disk");else if(e===_states2.default.UPLOAD)t.disabled=!0,t.title=(0,_localization2.default)("This dataset must finish uploading before it can be viewed");else if(e===_states2.default.NEW)t.disabled=!0,t.title=(0,_localization2.default)("This dataset is not yet viewable");else{t.title=(0,_localization2.default)("View data"),t.href=this.model.urls.display;var a=this;t.onclick=function(e){Galaxy.frame&&Galaxy.frame.active&&(Galaxy.frame.addDataset(a.model.get("id")),e.preventDefault())}}return t.faIcon="fa-eye",(0,_faIconButton2.default)(t)},_renderDetails:function(){if(this.model.get("state")===_states2.default.NOT_VIEWABLE)return $(this.templates.noAccess(this.model.toJSON(),this));var e=_super.prototype._renderDetails.call(this);return e.find(".actions .left").empty().append(this._renderSecondaryActions()),e.find(".summary").html(this._renderSummary()).prepend(this._renderDetailMessages()),e.find(".display-applications").html(this._renderDisplayApplications()),this._setUpBehaviors(e),e},_renderSummary:function(){var e=this.model.toJSON(),t=this.templates.summaries[e.state];return(t=t||this.templates.summaries.unknown)(e,this)},_renderDetailMessages:function(){var e=this,t=$('<div class="detail-messages"></div>'),a=e.model.toJSON();return _.each(e.templates.detailMessages,function(s){t.append($(s(a,e)))}),t},_renderDisplayApplications:function(){return this.model.isDeletedOrPurged()?"":[this.templates.displayApplications(this.model.get("display_apps"),this),this.templates.displayApplications(this.model.get("display_types"),this)].join("")},_renderSecondaryActions:function(){switch(this.debug("_renderSecondaryActions"),this.model.get("state")){case _states2.default.NOT_VIEWABLE:return[];case _states2.default.OK:case _states2.default.FAILED_METADATA:case _states2.default.ERROR:return[this._renderDownloadButton(),this._renderShowParamsButton()]}return[this._renderShowParamsButton()]},_renderShowParamsButton:function(){return(0,_faIconButton2.default)({title:(0,_localization2.default)("View details"),classes:"params-btn",href:this.model.urls.show_params,target:this.linkTarget,faIcon:"fa-info-circle",onclick:function(e){Galaxy.frame&&Galaxy.frame.active&&(Galaxy.frame.add({title:"Dataset details",url:this.href}),e.preventDefault(),e.stopPropagation())}})},_renderDownloadButton:function(){return this.model.get("purged")||!this.model.hasData()?null:_.isEmpty(this.model.get("meta_files"))?$(['<a class="download-btn icon-btn" ','href="',this.model.urls.download,'" title="'+(0,_localization2.default)("Download")+'" download>','<span class="fa fa-floppy-o"></span>',"</a>"].join("")):this._renderMetaFileDownloadButton()},_renderMetaFileDownloadButton:function(){var e=this.model.urls;return $(['<div class="metafile-dropdown dropdown">','<a class="download-btn icon-btn" href="javascript:void(0)" data-toggle="dropdown"',' title="'+(0,_localization2.default)("Download")+'">','<span class="fa fa-floppy-o"></span>',"</a>",'<ul class="dropdown-menu" role="menu" aria-labelledby="dLabel">','<li><a href="'+e.download+'" download>',(0,_localization2.default)("Download dataset"),"</a></li>",_.map(this.model.get("meta_files"),function(t){return['<li><a href="',e.meta_download+t.file_type,'">',(0,_localization2.default)("Download")," ",t.file_type,"</a></li>"].join("")}).join("\n"),"</ul>","</div>"].join("\n"))},_renderNametags:function(){return _.template(["<% _.each(_.sortBy(_.uniq(tags), function(x) { return x }), function(tag){ %>",'<% if (tag.indexOf("name:") == 0){ %>','<span class="label label-info"><%- tag.slice(5) %></span>',"<% } %>","<% }); %>"].join(""))({tags:this.model.get("tags")})},events:_.extend(_.clone(_super.prototype.events),{"click .display-btn":function(e){this.trigger("display",this,e)},"click .params-btn":function(e){this.trigger("params",this,e)},"click .download-btn":function(e){this.trigger("download",this,e)}}),toString:function(){return"DatasetListItemView("+(this.model?this.model+"":"(no model)")+")"}});DatasetListItemView.prototype.templates=function(){var e=_.extend({},_super.prototype.templates.warnings,{failed_metadata:_baseMvc2.default.wrapTemplate(['<% if( model.state === "failed_metadata" ){ %>','<div class="warningmessagesmall">',(0,_localization2.default)("An error occurred setting the metadata for this dataset"),"</div>","<% } %>"]),error:_baseMvc2.default.wrapTemplate(["<% if( model.error ){ %>",'<div class="errormessagesmall">',(0,_localization2.default)("There was an error getting the data for this dataset"),": <%- model.error %>","</div>","<% } %>"]),purged:_baseMvc2.default.wrapTemplate(["<% if( model.purged ){ %>",'<div class="purged-msg warningmessagesmall">',(0,_localization2.default)("This dataset has been deleted and removed from disk"),"</div>","<% } %>"]),deleted:_baseMvc2.default.wrapTemplate(["<% if( model.deleted && !model.purged ){ %>",'<div class="deleted-msg warningmessagesmall">',(0,_localization2.default)("This dataset has been deleted"),"</div>","<% } %>"])}),t=_baseMvc2.default.wrapTemplate(['<div class="details">','<div class="summary"></div>','<div class="actions clear">','<div class="left"></div>','<div class="right"></div>',"</div>","<% if( !dataset.deleted && !dataset.purged ){ %>",'<div class="tags-display"></div>','<div class="annotation-display"></div>','<div class="display-applications"></div>',"<% if( dataset.peek ){ %>",'<pre class="dataset-peek"><%= dataset.peek %></pre>',"<% } %>","<% } %>","</div>"],"dataset"),a=_baseMvc2.default.wrapTemplate(['<div class="details">','<div class="summary">',(0,_localization2.default)("You do not have permission to view this dataset"),"</div>","</div>"],"dataset"),s={};s[_states2.default.OK]=s[_states2.default.FAILED_METADATA]=_baseMvc2.default.wrapTemplate(["<% if( dataset.misc_blurb ){ %>",'<div class="blurb">','<span class="value"><%- dataset.misc_blurb %></span>',"</div>","<% } %>","<% if( dataset.file_ext ){ %>",'<div class="datatype">','<label class="prompt">',(0,_localization2.default)("format"),"</label>",'<span class="value"><%- dataset.file_ext %></span>',"</div>","<% } %>","<% if( dataset.metadata_dbkey ){ %>",'<div class="dbkey">','<label class="prompt">',(0,_localization2.default)("database"),"</label>",'<span class="value">',"<%- dataset.metadata_dbkey %>","</span>","</div>","<% } %>","<% if( dataset.misc_info ){ %>",'<div class="info">','<span class="value"><%- dataset.misc_info %></span>',"</div>","<% } %>"],"dataset"),s[_states2.default.NEW]=_baseMvc2.default.wrapTemplate(["<div>",(0,_localization2.default)("This is a new dataset and not all of its data are available yet"),"</div>"],"dataset"),s[_states2.default.NOT_VIEWABLE]=_baseMvc2.default.wrapTemplate(["<div>",(0,_localization2.default)("You do not have permission to view this dataset"),"</div>"],"dataset"),s[_states2.default.DISCARDED]=_baseMvc2.default.wrapTemplate(["<div>",(0,_localization2.default)("The job creating this dataset was cancelled before completion"),"</div>"],"dataset"),s[_states2.default.QUEUED]=_baseMvc2.default.wrapTemplate(["<div>",(0,_localization2.default)("This job is waiting to run"),"</div>"],"dataset"),s[_states2.default.RUNNING]=_baseMvc2.default.wrapTemplate(["<div>",(0,_localization2.default)("This job is currently running"),"</div>"],"dataset"),s[_states2.default.UPLOAD]=_baseMvc2.default.wrapTemplate(["<div>",(0,_localization2.default)("This dataset is currently uploading"),"</div>"],"dataset"),s[_states2.default.SETTING_METADATA]=_baseMvc2.default.wrapTemplate(["<div>",(0,_localization2.default)("Metadata is being auto-detected"),"</div>"],"dataset"),s[_states2.default.PAUSED]=_baseMvc2.default.wrapTemplate(["<div>",(0,_localization2.default)('This job is paused. Use the "Resume Paused Jobs" in the history menu to resume'),"</div>"],"dataset"),s[_states2.default.ERROR]=_baseMvc2.default.wrapTemplate(["<% if( !dataset.purged ){ %>","<div><%- dataset.misc_blurb %></div>","<% } %>",'<span class="help-text">',(0,_localization2.default)("An error occurred with this dataset"),":</span>",'<div class="job-error-text"><%- dataset.misc_info %></div>'],"dataset"),s[_states2.default.EMPTY]=_baseMvc2.default.wrapTemplate(["<div>",(0,_localization2.default)("No data"),": <i><%- dataset.misc_blurb %></i></div>"],"dataset"),s.unknown=_baseMvc2.default.wrapTemplate(['<div>Error: unknown dataset state: "<%- dataset.state %>"</div>'],"dataset");var i={resubmitted:_baseMvc2.default.wrapTemplate(["<% if( model.resubmitted ){ %>",'<div class="resubmitted-msg infomessagesmall">',(0,_localization2.default)("The job creating this dataset has been resubmitted"),"</div>","<% } %>"])},l=_baseMvc2.default.wrapTemplate(["<% _.each( apps, function( app ){ %>",'<div class="display-application">','<span class="display-application-location"><%- app.label %></span> ','<span class="display-application-links">',"<% _.each( app.links, function( link ){ %>",'<a target="<%- link.target %>" href="<%- link.href %>">',"<% print( _l( link.text ) ); %>","</a> ","<% }); %>","</span>","</div>","<% }); %>"],"apps");return _.extend({},_super.prototype.templates,{warnings:e,details:t,noAccess:a,summaries:s,detailMessages:i,displayApplications:l})}(),exports.default={DatasetListItemView:DatasetListItemView};
//# sourceMappingURL=../../../maps/mvc/dataset/dataset-li.js.map
