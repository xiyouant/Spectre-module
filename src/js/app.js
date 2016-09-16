/**
 * @author leozhang2018 <leozhang2018@gmail.com>
 * @license http://www.opensource.org/licenses/MIT
 */

//时间格式化函数
var dateFormat = {
    Y: function(timeStamp) {
        var date = new Date(timeStamp * 1000);
        Y = date.getFullYear() + '-';
        return Y;
    },
    M: function(timeStamp) {
        var date = new Date(timeStamp * 1000);
        Y = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
        return M;
    },
    D: function(timeStamp) {
        var date = new Date(timeStamp * 1000);
        D = date.getDate() + ' ';
        return D;
    },
    h: function(timeStamp) {
        var date = new Date(timeStamp * 1000);
        h = date.getHours() + ':';
        return h;
    },
    m: function(timeStamp) {
        var date = new Date(timeStamp * 1000);
        m = date.getMinutes();
        return m;
    },
    s: function(timeStamp) {
        var date = new Date(timeStamp * 1000);
        s = date.getSeconds();
        return s;
    },
    h_m: function(timeStamp) {
        return (this.h(timeStamp) + this.m(timeStamp));
    }

}

//流量统计修改 DOM
var trafficStatistics = {
    Receive: function(interface, traffic_data) {
        $(interface).text(traffic_data);
    },
    Transmit: function(interface, traffic_data) {
        $(interface).text(traffic_data);
    },
    Summary: function(domId, traffic_data) {
        $(domId).text(traffic_data);
    }
}


//获取网络接口
var getInterface = function(data) {
    var interfaces = [];
    for (var i = 0; i < data[0].length; i++) {
        for (var key in data[0][i]) {
            interfaces.push(key);
        }
    }
    return interfaces;
}


var domainGraph = function() {
    $.ajax({
        url: 'http://127.0.0.1/index.php/api/query?query=domain',
        type: 'GET',
        async: true,
        cache: false,
        dataType: 'json',
        success: function(data) {
            var dataSource = [];
            var info = [];
            for (var i = 0; i < data.length; i++) {
                info.push(data[i].url);
                info.push(parseInt(data[i].count));
            };
            while (info.length) {
                dataSource.push(info.splice(0, 2));
            };
            //时间格式化
            var startTimestampHour = dateFormat.h(data[0].startTimestamp);
            var endTimestampHour = dateFormat.h(data[0].endTimestamp);
            var startTimestampMinutes = dateFormat.m(data[0].startTimestamp);
            var endTimestampMinutes = dateFormat.m(data[0].endTimestamp);

            /*图表设置*/
            //定义标题
            var title = {
                text: 'TOP 10 domains in the past 1 hour', //指定图表标题
                style: {
                    color: '#6b717d',
                    fontSize: '17px',
                    fontFamily: 'Avenir Next Condensed,Alegreya Sans',
                }
            };
            //定义副标题
            var subtitle = {
                text: 'Collect time: ' + startTimestampHour + startTimestampMinutes + ' - ' + endTimestampHour + endTimestampMinutes,
                style: {
                    color: '#6b717d',
                    fontSize: '12px',
                    fontWeight: '600',
                    fontFamily: 'Avenir Next Condensed,Alegreya Sans'
                }
            };

            //定义数据列
            var data_series = {
                name: '访问情况', //数据列名
                colorByPoint: true, //或者直接写在这里:http://www.hcharts.cn/docs/index.php?doc=basic-color
                data: dataSource,
                dataLabels: {
                    enabled: true,
                    rotation: 0,
                    color: '#789',
                    align: 'center',
                    format: '{point.y}', // one decimal
                    y: 1, // 10 pixels down from the top
                    style: {
                        fontSize: '16px',
                        fontWeight: '500',
                        fontFamily: 'Avenir Next Condensed,Alegreya Sans',
                    }
                }

            };

            //新建 Chart 对象
            var chart = new Highcharts.Chart(domain_options);
            //设置主标题
            chart.setTitle(title);
            //设置副标题
            chart.setTitle(null, subtitle);
            //渲染数据列
            chart.addSeries(data_series);
        },
        error: function(e) {
            alert("Get domain failed");
        }
    });
};


var trafficGraph = function() {
    $.ajax({
        url: 'http://192.168.2.1/api/query?query=traffic',
        type: 'GET',
        async: true,
        cache: false,
        dataType: 'json',
        success: function(data) {
            var timeStampArray = [];
            //ShadowCopy
            var upload = data[0][3].p3p1[1].upload.slice();
            var download = data[0][3].p3p1[0].download.slice();
            for (var i = 0; i < data[0][3].p3p1[2].timeStamp.length; i++) {
                //时间格式化 push 到时间戳数组
                timeStampArray.push(dateFormat.h_m(data[0][3].p3p1[2].timeStamp[i]));
            }

            /*图表设置*/
            //副标题
            var subtitle = {
                text: 'interface:' + ' ' + getInterface(data)[3],
                style: {
                    color: '#6b717d',
                    fontSize: '12px',
                    fontWeight: '600',
                    fontFamily: 'Avenir Next Condensed,Alegreya Sans'
                }
            }

            //初始化 Chart 对象
            var chart = new Highcharts.Chart(traffic_options);
            //设置 x轴 Categories
            chart.xAxis[0].setCategories(timeStampArray.reverse());
            //设置副标题
            chart.setTitle(null, subtitle);
            //渲染数据
            if (chart.series.length === 0) {
                chart.addSeries({
                    name: 'Download',
                    color: '#ff2d77',
                    data: download.reverse()
                });
                chart.addSeries({
                    name: 'Upload',
                    data: upload.reverse()
                });
            };

            /*Debug start*/
            // interface:p3p1
            console.log("interface:")
            console.log(data[0][1]);
            // p3p1 下载
            console.log("p3p1 下载:");
            console.log(data[0][3].p3p1[0].download);
            // p3p1 上传
            console.log("p3p1 上传:");
            console.log(data[0][3].p3p1[1].upload);
            // p3p1 时间戳
            console.log("p3p1 时间戳:");
            console.log(data[0][3].p3p1[2].timeStamp);
            // p3p1 时间戳数组
            console.log("p3p1 时间戳数组:");
            console.log(timeStampArray);
            //网络接口
            console.log("网络接口:");
            console.log(getInterface(data));
            console.log(data[0]);
            trafficStatistics.Receive("#p3p1-receive", ((data[0][3].p3p1[0].download[0]) / 1000).toFixed(2));
            trafficStatistics.Transmit("#p3p1-transmit", ((data[0][3].p3p1[1].upload[0]) / 1000).toFixed(2));
            trafficStatistics.Transmit("#p4p1-transmit", ((data[0][2].p4p1[1].upload[0]) / 1000).toFixed(2));
            trafficStatistics.Receive("#p4p1-receive", ((data[0][2].p4p1[0].download[0]) / 1000).toFixed(2));
            trafficStatistics.Summary("#summary", (((data[0][3].p3p1[0].download[0]) + (data[0][3].p3p1[1].upload[0])) / 1000).toFixed(2));

        },
        error: function(e) {
            alert("fail");
        }
    });
};

//domain 图表初始化配置
var domain_options = {
    chart: {
        type: 'column', //指定图表的类型，默认是折线图（line）
        renderTo: "domains-container",
        //背景颜色
        backgroundColor: '#222632',
        // marginBottom:'10px',
    },
    credits: {
        enabled: false, // 默认值，如果想去掉版权信息，设置为 false 即可
        text: 'Spectre', // 显示的文字
        href: 'http://192.168.2.1', // 链接地址
        style: { // 样式设置
            cursor: 'pointer',
            fontSize: '10px'
        }
    },
    title: {
        text: 'TOP 10 domains in the past 1 hour', //指定图表标题
        style: {
            color: (217, 227, 239, .4),
            fontSize: '18px',
        }
    },
    colors: ['#ff2d77', '#ff2d77', '#ff2d77', '#ff2d77', '#ff2d77', '#ff2d77', '#ff2d77', '#ff2d77', '#ff2d77', '#ff2d77'],
    xAxis: { //指定x轴分组
        //x轴颜色
        lineColor: 'rgba(217,227,239,.4)',
        type: 'category',
        // gridLineColor: '#3d4653',
        tickWidth: 0,
        labels: {
            enabled: false, //关闭 x 轴标记
            rotation: -45,
            style: {
                fontSize: '10px',
                fontFamily: 'Avenir Next Condensed,Alegreya Sans'
            }
        },

    },
    yAxis: { //指定 y 轴的标题
        //隐藏网格线
        gridLineWidth: 0,
        gridLineColor: '#3d4653',
        min: 0,
        title: {
            text: 'Hit Counts',
            style: { // 文字内容相关样式
                color: "#606060",
                fontSize: "10px"
            }
        }
    },
    //http://api.highcharts.com/highcharts#plotOptions.bar.borderWidth
    plotOptions: {
        series: {
            borderWidth: 0,
            states: {
                // http://api.highcharts.com/highcharts#plotOptions.column.states.hover
                hover: {
                    // brightness: -0.3, // darken
                    color: 'rgb(119, 136, 153)'
                }
            }
        }
    },
    legend: {
        enabled: false
            //图例。用不同形状、颜色、文字等 标示不同数据列，通过点击标示可以显示或隐藏该数据列。
    },
    tooltip: {
        pointFormat: '访问情况: </b><span style="color:#ff2d77;">{point.y}</span> 次',
        borderWidth: 1,
        borderRadius: 10,
        shadow: true,
        style: { // 文字内容相关样式
            color: "#000",
            fontSize: "13px",
            fontWeight: '500'
        }
    },
    series: []
};

// traffic 图表初始化配置
var traffic_options = {
    chart: {
        type: 'areaspline',
        renderTo: "traffic-container",
        backgroundColor: '#222632'
    },
    title: {
        // text: null
        text: "Traffic of network",
        style: {
            fontSize: '18px',
            // fontWeight: '500',
            fontFamily: 'Avenir Next Condensed,Alegreya Sans',
            color: '#6b717d'
        }
    },
    subtitle: {
        text: 'interface:' + ' ' + '',
        style: {
            color: '#6b717d',
            fontSize: '12px',
            fontWeight: '600',
            fontFamily: 'Avenir Next Condensed,Alegreya Sans'
        }
    },
    legend: {
        enabled: false
            // layout: 'vertical',
            // align: 'left',
            // verticalAlign: 'top',
            // x: 150,
            // y: 100,
            // floating: true,
            // borderWidth: 1,
            // backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
    },
    xAxis: {
        //刻度宽度
        tickWidth: 0,
        //x轴颜色
        lineColor: 'rgba(217,227,239,.4)',
        categories: [],
        // plotBands: [{ // visualize the weekend
        //     from: 4.5,
        //     to: 6.5,
        //     color: 'rgba(68, 170, 213, .2)'
        // }],

        labels: {
            style: {
                fontSize: '10px',
                fontFamily: 'Avenir Next Condensed,Alegreya Sans'
            }
        }

    },
    yAxis: {
        title: {
            enabled: false
        },
        gridLineWidth: 0
    },
    tooltip: {
        shared: true,
        valueSuffix: ' MB'
    },
    credits: {
        enabled: false
    },
    plotOptions: {
        areaspline: {
            fillOpacity: 0.5
        }
    },
    series: []
};

$(document).ready(function() {
    domainGraph();
    trafficGraph();
    setInterval("domainGraph();", 600000);
    setInterval("trafficGraph();", 600000);
});