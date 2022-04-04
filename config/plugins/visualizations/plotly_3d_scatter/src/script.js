import { request as requestDatasets } from "@galaxyproject/charts/lib/utilities/datasets";

function unpack(rows, key) {
    return rows.map(function(row)
    { return row[key]; });}


/* Prepare containers */
function createContainers(tag, chart, target) {
    var n = chart.groups.length;
    var $container = $("#" + target);
    $container.empty();
    const targets = [];
    for (var i = 0; i < n; i++) {
        var panel_id = "vis-container-id-" + i;
        var $panel = $("<" + tag + " style='float: left; height: 100%;' />").attr("id", panel_id);
        $panel.width(parseInt(100 / n) + "%");
        $container.append($panel);
        targets.push(panel_id);
    }
    return targets;
}


window.bundleEntries = window.bundleEntries || {};

window.bundleEntries.plotly_3D_scatter = function (options) {
    var pca_result = [[-3319620.1072033765, -2315287.815731736, -76118.74083265247], 
                   [-3250503.1922863396, -2227887.59391699, 76653.98224809414], 
                   [-3758033.641737464, 4303037.112285252, -1147.0858025365758], 
                   [4991670.270051215, 110691.70877630105, 32182.85157100945], 
                   [5336486.671175947, 129446.5885871675, -31571.007183913756]]


    var trace = {
        x:unpack(pca_result, 0), y: unpack(pca_result, 1), z: unpack(pca_result, 2),
        mode: 'markers',
        marker: {
            size: 5,
            line: {
            color: 'rgba(217, 217, 217, 0.14)',
            width: 0.5},
            opacity: 0.8},
        type: 'scatter3d'
    };

    var data = [trace];
    var layout = {margin: {
        l: 0,
        r: 0,
        b: 0,
        t: 0
      }};

    options.targets = createContainers(options.chart, options.target);
    options.render = function (canvas_id, groups) {
        new Plotly.newPlot({canvas_id, data, layout});
        return true;
    };
    requestPanels(options);
}
