

// airtable = require("airtable");
// var app = new Vue({
//     el: '#app',
//     data: {
//         items: []
//     },
//     mounted: function(){
//        this.loadItems(); 
//     },
//     methods: {
//         loadItems: function(){
            
//             // Init variables
//             var self = this
//             var app_id = "appcaG28GpoJtJBPc";
//             var app_key = "keyoeiRy8krdCL8J1";
//             this.items = []
//     axios.get(
//                 "https://api.airtable.com/v0/"+app_id+"/SoA_Awardees?view=Grid%20view",
//                 { 
//                     headers: { Authorization: "Bearer "+app_key } 
//                 }
//             ).then(function(response){
//                 self.items = response.data.records
//                 // console.log(response.data.records)
//             }).catch(function(error){
//                 console.log(error)
//             })
//         }
//     }
// })

var app = new Vue({
    el: '#map',
    data: {
        items: []
    },
    mounted: function(){
       this.loadItems(); 
    },
    methods: {
        loadItems: function(){
            
            // Init variables
            var self = this
            var app_id = "appcaG28GpoJtJBPc";
            var app_key = "keyoeiRy8krdCL8J1";
            this.items = []
    axios.get(
                "https://api.airtable.com/v0/"+app_id+"/SoA_Awardees?view=Grid%20view",
                { 
                    headers: { Authorization: "Bearer "+app_key } 
                }
            ).then(function(response){
                // self.items = response.data.records
                // console.log(self.items)
                console.log(response.data.records)
                loadAndShowData(response.data.records)

            }).catch(function(error){
                console.log(error)
            })
        }
    }
})

function loadAndShowData(data) {

    points = data.map(d => {
        return {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [d.fields.Longitude, d.fields.Latitude]
          },
          properties: d.fields
        };
      })
    console.log(points)
    showData(points)
}

// d3.csv("https://gist.githubusercontent.com/carolinecullinan/991ae7366ca11688b92ab6ddd01417ab/raw/b1681f8220ae572880795cbd27a584cf6b19855d/SnailofApproval_PracticeData.csv").then(function(data) {
// // console.log(data)

// points = data.map(d => {
//     return {
//       type: 'Feature',
//       geometry: {
//         type: 'Point',
//         coordinates: [d.Longitude, d.Latitude]
//       },
//       properties: d
//     };
//   })
// console.log(points)
// // mapboxAPI()
// // mapboxglGeocoder()
// showData(points)
// })

mapboxgl.accessToken = 'pk.eyJ1Ijoic2xvd2Zvb2QtdXNhIiwiYSI6ImNramtoYjh4OTR6b3cyem5xbHE2OXlnYnEifQ.AOqNJ03XcVH5QLdVfFC27g';

function showData(points) {

    //   const container = html`<div id='map'>`;
    // container = d3.select("#map");
    // yield container;

    var bounds = [
        [-167.054013268, 17.6809062054], // Southwest coordinates
        [-60.1925353874, 62.412799208] // Northeast coordinates
    ]; 
    
    
    // -167.054013268,17.6809062054,-60.1925353874,62.412799208
    
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/light-v10',
        center: [-98.58, 39.82], // starting position [lng, lat]
        zoom: 3.5,
        minZoom: 3,
        // maxBounds: bounds // Sets bounds as max
    });

    map.addControl(
        new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        countries: 'us'
        }),
        'top-left'
    );
    
    map.addControl(new mapboxgl.NavigationControl(), 'top-left'); //zoom controls

    mapContainer = map.getCanvasContainer();

    const svg = d3
        .select(mapContainer)
        .append('svg')
        .attr('width', '100%')
        .attr('height', '600')
        .style('position', 'absolute')
        .style('z-index', 2);

    // console.log("test")
    // console.log(points.filter(d=>(d.geometry.coordinates[0]!=undefined)||(d.geometry.coordinates[0]!=undefined)))
    dots = svg
        .selectAll('circle')
        .data(points.filter(d=>(d.geometry.coordinates[0]!=undefined)||(d.geometry.coordinates[0]!=undefined)))
        .join('circle')
        .attr('r', 7)
        // .attr("class", d=> d.properties.Award + d.properties.Vegetarian) // "vegeterian"
        // .style('fill', d => d.properties.Color)
        .style('fill', '#DA2028')

        .style('opacity', 0.7)
        // .style('cursor', 'crosshair')
        // .on('mouseover', mouseover)
        .on('mouseover', showtooltip)
        // .on('mousemove', showtooltip)
        .on('mouseleave', hidetooltip)
        .on("click",function(d){click(d)});

    //hook-up d3 and mapbox
    function project(d) {
        return map.project(new mapboxgl.LngLat(d[0], d[1]));
    }

    function update() {
        dots
        .attr('cx', d => project(d.geometry.coordinates).x)
        .attr('cy', d => project(d.geometry.coordinates).y);
    }

    //redraw points when map moves
    map.on('viewreset', update);
    map.on('move', update);
    map.on('moveend', update);
    // map.on('click', hideclicktip);

    update();

    const checked = {};

    // const checked = {"BIPOC Run": "0",
    //                 "Breakfast": "0",
    //                 "Delivery": "0",
    //                 "Dessert": "0",
    //                 "Dine-In": "0",
    //                 "Dinner": "0",
    //                 "Halal": "0",
    //                 "Kosher": "0",
    //                 "Late Night": "0",
    //                 "Lunch": "0",
    //                 "Take-out": "0",
    //                 "Vegan": "0", 
    //                 "Vegetarian": "0", 
    //                 "Women Run": "0"
    //                 };

        function filterCheck() {
            // console.log(checked)
            d3.selectAll(".check").each(function(d){
            // d3.selectAll("input[class=check]").on("change", function() {
                cb = d3.select(this);
                grp = cb.property("value")
                id = cb.property("id")

                // If the box is check, I show the group
                if(cb.property("checked")){
                    //   svg.selectAll("."+grp).transition().duration(1000).style("opacity", 1).attr("r", function(d){ return size(d.size) })
                    // console.log(grp)
                    // console.log(id)
                    checked[id] = grp
                    // console.log(Object.keys(checked)[0])
                    // console.log(Object.keys(checked)[1])
                    // console.log(Object.keys(checked).length)

                    // dots.style("opacity", "0.2")

                    // // console.log(dots.filter(d=>d.properties[id]===checked[id]))

                    // dots.filter(d=>d.properties[id]===checked[id]).style("opacity", "0.7")

                    // console.log()

                    // Otherwise I hide it
                }else{

                    delete checked[id]
                    // console.log(checked)
                    // dots.filter(d=>d.properties[id]!==checked[id]).style("opacity", "0.7")
                    
                }
                
                if(Object.keys(checked).length===0) {
                    console.log(checked)

                    dots.style("opacity", "0.7")

                } else if(Object.keys(checked).length===1) {
                    dots.style("opacity", "0.2")
                    console.log(checked)

                    console.log(dots.filter(d=>d.properties[Object.keys(checked)[0]]===checked[Object.keys(checked)[0]]))

                    dots.filter(d=>d.properties[Object.keys(checked)[0]]===checked[Object.keys(checked)[0]]).style("opacity", "0.7")

                } else if(Object.keys(checked).length===2) {
                    console.log(checked)
                    dots.style("opacity", "0.2")

                    console.log(dots.filter(d=>d.properties[Object.keys(checked)[0]]===checked[Object.keys(checked)[0]]&&
                                                d.properties[Object.keys(checked)[1]]===checked[Object.keys(checked)[1]]))

                    dots.filter(d=>d.properties[Object.keys(checked)[0]]===checked[Object.keys(checked)[0]]&&
                                d.properties[Object.keys(checked)[1]]===checked[Object.keys(checked)[1]]).style("opacity", "0.7")
                
                } else if(Object.keys(checked).length===3) {
                    console.log(checked)
                    dots.style("opacity", "0.2")

                    console.log(dots.filter(d=>d.properties[Object.keys(checked)[0]]===checked[Object.keys(checked)[0]]&&
                                                d.properties[Object.keys(checked)[1]]===checked[Object.keys(checked)[1]]&&
                                                d.properties[Object.keys(checked)[2]]===checked[Object.keys(checked)[2]]))

                    dots.filter(d=>d.properties[Object.keys(checked)[0]]===checked[Object.keys(checked)[0]]&&
                                d.properties[Object.keys(checked)[1]]===checked[Object.keys(checked)[1]]&&
                                d.properties[Object.keys(checked)[2]]===checked[Object.keys(checked)[2]]).style("opacity", "0.7")
                
                } else if(Object.keys(checked).length===4) {
                    console.log(checked)
                    dots.style("opacity", "0.2")

                    console.log(dots.filter(d=>d.properties[Object.keys(checked)[0]]===checked[Object.keys(checked)[0]]&&
                                                d.properties[Object.keys(checked)[1]]===checked[Object.keys(checked)[1]]&&
                                                d.properties[Object.keys(checked)[2]]===checked[Object.keys(checked)[2]]&&
                                                d.properties[Object.keys(checked)[3]]===checked[Object.keys(checked)[3]]))

                    dots.filter(d=>d.properties[Object.keys(checked)[0]]===checked[Object.keys(checked)[0]]&&
                                d.properties[Object.keys(checked)[1]]===checked[Object.keys(checked)[1]]&&
                                d.properties[Object.keys(checked)[2]]===checked[Object.keys(checked)[2]]&&
                                d.properties[Object.keys(checked)[3]]===checked[Object.keys(checked)[3]]).style("opacity", "0.7")
                
                } else if(Object.keys(checked).length===5) {
                    console.log(checked)
                    dots.style("opacity", "0.2")

                    console.log(dots.filter(d=>d.properties[Object.keys(checked)[0]]===checked[Object.keys(checked)[0]]&&
                                                d.properties[Object.keys(checked)[1]]===checked[Object.keys(checked)[1]]&&
                                                d.properties[Object.keys(checked)[2]]===checked[Object.keys(checked)[2]]&&
                                                d.properties[Object.keys(checked)[3]]===checked[Object.keys(checked)[3]]&&
                                                d.properties[Object.keys(checked)[4]]===checked[Object.keys(checked)[4]]))

                    dots.filter(d=>d.properties[Object.keys(checked)[0]]===checked[Object.keys(checked)[0]]&&
                                d.properties[Object.keys(checked)[1]]===checked[Object.keys(checked)[1]]&&
                                d.properties[Object.keys(checked)[2]]===checked[Object.keys(checked)[2]]&&
                                d.properties[Object.keys(checked)[3]]===checked[Object.keys(checked)[3]]&&
                                d.properties[Object.keys(checked)[4]]===checked[Object.keys(checked)[4]]).style("opacity", "0.7")
                
                } else if(Object.keys(checked).length===6) {
                    console.log(checked)
                    dots.style("opacity", "0.2")

                    console.log(dots.filter(d=>d.properties[Object.keys(checked)[0]]===checked[Object.keys(checked)[0]]&&
                                                d.properties[Object.keys(checked)[1]]===checked[Object.keys(checked)[1]]&&
                                                d.properties[Object.keys(checked)[2]]===checked[Object.keys(checked)[2]]&&
                                                d.properties[Object.keys(checked)[3]]===checked[Object.keys(checked)[3]]&&
                                                d.properties[Object.keys(checked)[4]]===checked[Object.keys(checked)[4]]&&
                                                d.properties[Object.keys(checked)[5]]===checked[Object.keys(checked)[5]]))

                    dots.filter(d=>d.properties[Object.keys(checked)[0]]===checked[Object.keys(checked)[0]]&&
                                d.properties[Object.keys(checked)[1]]===checked[Object.keys(checked)[1]]&&
                                d.properties[Object.keys(checked)[2]]===checked[Object.keys(checked)[2]]&&
                                d.properties[Object.keys(checked)[3]]===checked[Object.keys(checked)[3]]&&
                                d.properties[Object.keys(checked)[4]]===checked[Object.keys(checked)[4]]&&
                                d.properties[Object.keys(checked)[5]]===checked[Object.keys(checked)[5]]).style("opacity", "0.7")
                
                } else if(Object.keys(checked).length===7) {
                    console.log(checked)
                    dots.style("opacity", "0.2")

                    console.log(dots.filter(d=>d.properties[Object.keys(checked)[0]]===checked[Object.keys(checked)[0]]&&
                                                d.properties[Object.keys(checked)[1]]===checked[Object.keys(checked)[1]]&&
                                                d.properties[Object.keys(checked)[2]]===checked[Object.keys(checked)[2]]&&
                                                d.properties[Object.keys(checked)[3]]===checked[Object.keys(checked)[3]]&&
                                                d.properties[Object.keys(checked)[4]]===checked[Object.keys(checked)[4]]&&
                                                d.properties[Object.keys(checked)[5]]===checked[Object.keys(checked)[5]]&&
                                                d.properties[Object.keys(checked)[6]]===checked[Object.keys(checked)[6]]))

                    dots.filter(d=>d.properties[Object.keys(checked)[0]]===checked[Object.keys(checked)[0]]&&
                                d.properties[Object.keys(checked)[1]]===checked[Object.keys(checked)[1]]&&
                                d.properties[Object.keys(checked)[2]]===checked[Object.keys(checked)[2]]&&
                                d.properties[Object.keys(checked)[3]]===checked[Object.keys(checked)[3]]&&
                                d.properties[Object.keys(checked)[4]]===checked[Object.keys(checked)[4]]&&
                                d.properties[Object.keys(checked)[5]]===checked[Object.keys(checked)[5]]&&
                                d.properties[Object.keys(checked)[6]]===checked[Object.keys(checked)[6]]).style("opacity", "0.7")
                
                } else if(Object.keys(checked).length===8) {
                    console.log(checked)
                    dots.style("opacity", "0.2")

                    console.log(dots.filter(d=>d.properties[Object.keys(checked)[0]]===checked[Object.keys(checked)[0]]&&
                                                d.properties[Object.keys(checked)[1]]===checked[Object.keys(checked)[1]]&&
                                                d.properties[Object.keys(checked)[2]]===checked[Object.keys(checked)[2]]&&
                                                d.properties[Object.keys(checked)[3]]===checked[Object.keys(checked)[3]]&&
                                                d.properties[Object.keys(checked)[4]]===checked[Object.keys(checked)[4]]&&
                                                d.properties[Object.keys(checked)[5]]===checked[Object.keys(checked)[5]]&&
                                                d.properties[Object.keys(checked)[6]]===checked[Object.keys(checked)[6]]&&
                                                d.properties[Object.keys(checked)[7]]===checked[Object.keys(checked)[7]]))

                    dots.filter(d=>d.properties[Object.keys(checked)[0]]===checked[Object.keys(checked)[0]]&&
                                d.properties[Object.keys(checked)[1]]===checked[Object.keys(checked)[1]]&&
                                d.properties[Object.keys(checked)[2]]===checked[Object.keys(checked)[2]]&&
                                d.properties[Object.keys(checked)[3]]===checked[Object.keys(checked)[3]]&&
                                d.properties[Object.keys(checked)[4]]===checked[Object.keys(checked)[4]]&&
                                d.properties[Object.keys(checked)[5]]===checked[Object.keys(checked)[5]]&&
                                d.properties[Object.keys(checked)[6]]===checked[Object.keys(checked)[6]]&&
                                d.properties[Object.keys(checked)[7]]===checked[Object.keys(checked)[7]]).style("opacity", "0.7")
                
                } else if(Object.keys(checked).length===9) {
                    console.log(checked)
                    dots.style("opacity", "0.2")

                    console.log(dots.filter(d=>d.properties[Object.keys(checked)[0]]===checked[Object.keys(checked)[0]]&&
                                                d.properties[Object.keys(checked)[1]]===checked[Object.keys(checked)[1]]&&
                                                d.properties[Object.keys(checked)[2]]===checked[Object.keys(checked)[2]]&&
                                                d.properties[Object.keys(checked)[3]]===checked[Object.keys(checked)[3]]&&
                                                d.properties[Object.keys(checked)[4]]===checked[Object.keys(checked)[4]]&&
                                                d.properties[Object.keys(checked)[5]]===checked[Object.keys(checked)[5]]&&
                                                d.properties[Object.keys(checked)[6]]===checked[Object.keys(checked)[6]]&&
                                                d.properties[Object.keys(checked)[7]]===checked[Object.keys(checked)[7]]&&
                                                d.properties[Object.keys(checked)[8]]===checked[Object.keys(checked)[8]]))

                    dots.filter(d=>d.properties[Object.keys(checked)[0]]===checked[Object.keys(checked)[0]]&&
                                d.properties[Object.keys(checked)[1]]===checked[Object.keys(checked)[1]]&&
                                d.properties[Object.keys(checked)[2]]===checked[Object.keys(checked)[2]]&&
                                d.properties[Object.keys(checked)[3]]===checked[Object.keys(checked)[3]]&&
                                d.properties[Object.keys(checked)[4]]===checked[Object.keys(checked)[4]]&&
                                d.properties[Object.keys(checked)[5]]===checked[Object.keys(checked)[5]]&&
                                d.properties[Object.keys(checked)[6]]===checked[Object.keys(checked)[6]]&&
                                d.properties[Object.keys(checked)[7]]===checked[Object.keys(checked)[7]]&&
                                d.properties[Object.keys(checked)[8]]===checked[Object.keys(checked)[8]]).style("opacity", "0.7")
                
                } else if(Object.keys(checked).length===10) {
                    console.log(checked)
                    dots.style("opacity", "0.2")

                    console.log(dots.filter(d=>d.properties[Object.keys(checked)[0]]===checked[Object.keys(checked)[0]]&&
                                                d.properties[Object.keys(checked)[1]]===checked[Object.keys(checked)[1]]&&
                                                d.properties[Object.keys(checked)[2]]===checked[Object.keys(checked)[2]]&&
                                                d.properties[Object.keys(checked)[3]]===checked[Object.keys(checked)[3]]&&
                                                d.properties[Object.keys(checked)[4]]===checked[Object.keys(checked)[4]]&&
                                                d.properties[Object.keys(checked)[5]]===checked[Object.keys(checked)[5]]&&
                                                d.properties[Object.keys(checked)[6]]===checked[Object.keys(checked)[6]]&&
                                                d.properties[Object.keys(checked)[7]]===checked[Object.keys(checked)[7]]&&
                                                d.properties[Object.keys(checked)[8]]===checked[Object.keys(checked)[8]]&&
                                                d.properties[Object.keys(checked)[9]]===checked[Object.keys(checked)[9]]))

                    dots.filter(d=>d.properties[Object.keys(checked)[0]]===checked[Object.keys(checked)[0]]&&
                                d.properties[Object.keys(checked)[1]]===checked[Object.keys(checked)[1]]&&
                                d.properties[Object.keys(checked)[2]]===checked[Object.keys(checked)[2]]&&
                                d.properties[Object.keys(checked)[3]]===checked[Object.keys(checked)[3]]&&
                                d.properties[Object.keys(checked)[4]]===checked[Object.keys(checked)[4]]&&
                                d.properties[Object.keys(checked)[5]]===checked[Object.keys(checked)[5]]&&
                                d.properties[Object.keys(checked)[6]]===checked[Object.keys(checked)[6]]&&
                                d.properties[Object.keys(checked)[7]]===checked[Object.keys(checked)[7]]&&
                                d.properties[Object.keys(checked)[8]]===checked[Object.keys(checked)[8]]&&
                                d.properties[Object.keys(checked)[9]]===checked[Object.keys(checked)[9]]).style("opacity", "0.7")
                
                } else if(Object.keys(checked).length===11) {
                    console.log(checked)
                    dots.style("opacity", "0.2")

                    console.log(dots.filter(d=>d.properties[Object.keys(checked)[0]]===checked[Object.keys(checked)[0]]&&
                                                d.properties[Object.keys(checked)[1]]===checked[Object.keys(checked)[1]]&&
                                                d.properties[Object.keys(checked)[2]]===checked[Object.keys(checked)[2]]&&
                                                d.properties[Object.keys(checked)[3]]===checked[Object.keys(checked)[3]]&&
                                                d.properties[Object.keys(checked)[4]]===checked[Object.keys(checked)[4]]&&
                                                d.properties[Object.keys(checked)[5]]===checked[Object.keys(checked)[5]]&&
                                                d.properties[Object.keys(checked)[6]]===checked[Object.keys(checked)[6]]&&
                                                d.properties[Object.keys(checked)[7]]===checked[Object.keys(checked)[7]]&&
                                                d.properties[Object.keys(checked)[8]]===checked[Object.keys(checked)[8]]&&
                                                d.properties[Object.keys(checked)[9]]===checked[Object.keys(checked)[9]]&&
                                                d.properties[Object.keys(checked)[10]]===checked[Object.keys(checked)[10]]))

                    dots.filter(d=>d.properties[Object.keys(checked)[0]]===checked[Object.keys(checked)[0]]&&
                                d.properties[Object.keys(checked)[1]]===checked[Object.keys(checked)[1]]&&
                                d.properties[Object.keys(checked)[2]]===checked[Object.keys(checked)[2]]&&
                                d.properties[Object.keys(checked)[3]]===checked[Object.keys(checked)[3]]&&
                                d.properties[Object.keys(checked)[4]]===checked[Object.keys(checked)[4]]&&
                                d.properties[Object.keys(checked)[5]]===checked[Object.keys(checked)[5]]&&
                                d.properties[Object.keys(checked)[6]]===checked[Object.keys(checked)[6]]&&
                                d.properties[Object.keys(checked)[7]]===checked[Object.keys(checked)[7]]&&
                                d.properties[Object.keys(checked)[8]]===checked[Object.keys(checked)[8]]&&
                                d.properties[Object.keys(checked)[9]]===checked[Object.keys(checked)[9]]&&
                                d.properties[Object.keys(checked)[10]]===checked[Object.keys(checked)[10]]).style("opacity", "0.7")
                
                } else if(Object.keys(checked).length===12) {
                    console.log(checked)
                    dots.style("opacity", "0.2")

                    console.log(dots.filter(d=>d.properties[Object.keys(checked)[0]]===checked[Object.keys(checked)[0]]&&
                                                d.properties[Object.keys(checked)[1]]===checked[Object.keys(checked)[1]]&&
                                                d.properties[Object.keys(checked)[2]]===checked[Object.keys(checked)[2]]&&
                                                d.properties[Object.keys(checked)[3]]===checked[Object.keys(checked)[3]]&&
                                                d.properties[Object.keys(checked)[4]]===checked[Object.keys(checked)[4]]&&
                                                d.properties[Object.keys(checked)[5]]===checked[Object.keys(checked)[5]]&&
                                                d.properties[Object.keys(checked)[6]]===checked[Object.keys(checked)[6]]&&
                                                d.properties[Object.keys(checked)[7]]===checked[Object.keys(checked)[7]]&&
                                                d.properties[Object.keys(checked)[8]]===checked[Object.keys(checked)[8]]&&
                                                d.properties[Object.keys(checked)[9]]===checked[Object.keys(checked)[9]]&&
                                                d.properties[Object.keys(checked)[10]]===checked[Object.keys(checked)[10]]&&
                                                d.properties[Object.keys(checked)[11]]===checked[Object.keys(checked)[11]]))

                    dots.filter(d=>d.properties[Object.keys(checked)[0]]===checked[Object.keys(checked)[0]]&&
                                d.properties[Object.keys(checked)[1]]===checked[Object.keys(checked)[1]]&&
                                d.properties[Object.keys(checked)[2]]===checked[Object.keys(checked)[2]]&&
                                d.properties[Object.keys(checked)[3]]===checked[Object.keys(checked)[3]]&&
                                d.properties[Object.keys(checked)[4]]===checked[Object.keys(checked)[4]]&&
                                d.properties[Object.keys(checked)[5]]===checked[Object.keys(checked)[5]]&&
                                d.properties[Object.keys(checked)[6]]===checked[Object.keys(checked)[6]]&&
                                d.properties[Object.keys(checked)[7]]===checked[Object.keys(checked)[7]]&&
                                d.properties[Object.keys(checked)[8]]===checked[Object.keys(checked)[8]]&&
                                d.properties[Object.keys(checked)[9]]===checked[Object.keys(checked)[9]]&&
                                d.properties[Object.keys(checked)[10]]===checked[Object.keys(checked)[10]]&&
                                d.properties[Object.keys(checked)[11]]===checked[Object.keys(checked)[11]]).style("opacity", "0.7")
                
                } else if(Object.keys(checked).length===13) {
                    console.log(checked)
                    dots.style("opacity", "0.2")

                    console.log(dots.filter(d=>d.properties[Object.keys(checked)[0]]===checked[Object.keys(checked)[0]]&&
                                                d.properties[Object.keys(checked)[1]]===checked[Object.keys(checked)[1]]&&
                                                d.properties[Object.keys(checked)[2]]===checked[Object.keys(checked)[2]]&&
                                                d.properties[Object.keys(checked)[3]]===checked[Object.keys(checked)[3]]&&
                                                d.properties[Object.keys(checked)[4]]===checked[Object.keys(checked)[4]]&&
                                                d.properties[Object.keys(checked)[5]]===checked[Object.keys(checked)[5]]&&
                                                d.properties[Object.keys(checked)[6]]===checked[Object.keys(checked)[6]]&&
                                                d.properties[Object.keys(checked)[7]]===checked[Object.keys(checked)[7]]&&
                                                d.properties[Object.keys(checked)[8]]===checked[Object.keys(checked)[8]]&&
                                                d.properties[Object.keys(checked)[9]]===checked[Object.keys(checked)[9]]&&
                                                d.properties[Object.keys(checked)[10]]===checked[Object.keys(checked)[10]]&&
                                                d.properties[Object.keys(checked)[11]]===checked[Object.keys(checked)[11]]&&
                                                d.properties[Object.keys(checked)[12]]===checked[Object.keys(checked)[12]]))

                    dots.filter(d=>d.properties[Object.keys(checked)[0]]===checked[Object.keys(checked)[0]]&&
                                d.properties[Object.keys(checked)[1]]===checked[Object.keys(checked)[1]]&&
                                d.properties[Object.keys(checked)[2]]===checked[Object.keys(checked)[2]]&&
                                d.properties[Object.keys(checked)[3]]===checked[Object.keys(checked)[3]]&&
                                d.properties[Object.keys(checked)[4]]===checked[Object.keys(checked)[4]]&&
                                d.properties[Object.keys(checked)[5]]===checked[Object.keys(checked)[5]]&&
                                d.properties[Object.keys(checked)[6]]===checked[Object.keys(checked)[6]]&&
                                d.properties[Object.keys(checked)[7]]===checked[Object.keys(checked)[7]]&&
                                d.properties[Object.keys(checked)[8]]===checked[Object.keys(checked)[8]]&&
                                d.properties[Object.keys(checked)[9]]===checked[Object.keys(checked)[9]]&&
                                d.properties[Object.keys(checked)[10]]===checked[Object.keys(checked)[10]]&&
                                d.properties[Object.keys(checked)[11]]===checked[Object.keys(checked)[11]]&&
                                d.properties[Object.keys(checked)[12]]===checked[Object.keys(checked)[12]]).style("opacity", "0.7")
                
                } else if(Object.keys(checked).length===14) {
                    console.log(checked)
                    dots.style("opacity", "0.2")

                    console.log(dots.filter(d=>d.properties[Object.keys(checked)[0]]===checked[Object.keys(checked)[0]]&&
                                                d.properties[Object.keys(checked)[1]]===checked[Object.keys(checked)[1]]&&
                                                d.properties[Object.keys(checked)[2]]===checked[Object.keys(checked)[2]]&&
                                                d.properties[Object.keys(checked)[3]]===checked[Object.keys(checked)[3]]&&
                                                d.properties[Object.keys(checked)[4]]===checked[Object.keys(checked)[4]]&&
                                                d.properties[Object.keys(checked)[5]]===checked[Object.keys(checked)[5]]&&
                                                d.properties[Object.keys(checked)[6]]===checked[Object.keys(checked)[6]]&&
                                                d.properties[Object.keys(checked)[7]]===checked[Object.keys(checked)[7]]&&
                                                d.properties[Object.keys(checked)[8]]===checked[Object.keys(checked)[8]]&&
                                                d.properties[Object.keys(checked)[9]]===checked[Object.keys(checked)[9]]&&
                                                d.properties[Object.keys(checked)[10]]===checked[Object.keys(checked)[10]]&&
                                                d.properties[Object.keys(checked)[11]]===checked[Object.keys(checked)[11]]&&
                                                d.properties[Object.keys(checked)[12]]===checked[Object.keys(checked)[12]]&&
                                                d.properties[Object.keys(checked)[13]]===checked[Object.keys(checked)[13]]))

                    dots.filter(d=>d.properties[Object.keys(checked)[0]]===checked[Object.keys(checked)[0]]&&
                                d.properties[Object.keys(checked)[1]]===checked[Object.keys(checked)[1]]&&
                                d.properties[Object.keys(checked)[2]]===checked[Object.keys(checked)[2]]&&
                                d.properties[Object.keys(checked)[3]]===checked[Object.keys(checked)[3]]&&
                                d.properties[Object.keys(checked)[4]]===checked[Object.keys(checked)[4]]&&
                                d.properties[Object.keys(checked)[5]]===checked[Object.keys(checked)[5]]&&
                                d.properties[Object.keys(checked)[6]]===checked[Object.keys(checked)[6]]&&
                                d.properties[Object.keys(checked)[7]]===checked[Object.keys(checked)[7]]&&
                                d.properties[Object.keys(checked)[8]]===checked[Object.keys(checked)[8]]&&
                                d.properties[Object.keys(checked)[9]]===checked[Object.keys(checked)[9]]&&
                                d.properties[Object.keys(checked)[10]]===checked[Object.keys(checked)[10]]&&
                                d.properties[Object.keys(checked)[11]]===checked[Object.keys(checked)[11]]&&
                                d.properties[Object.keys(checked)[12]]===checked[Object.keys(checked)[12]]&&
                                d.properties[Object.keys(checked)[13]]===checked[Object.keys(checked)[13]]).style("opacity", "0.7")
                
                } else if(Object.keys(checked).length===15) {
                    console.log(checked)
                    dots.style("opacity", "0.2")

                    console.log(dots.filter(d=>d.properties[Object.keys(checked)[0]]===checked[Object.keys(checked)[0]]&&
                                                d.properties[Object.keys(checked)[1]]===checked[Object.keys(checked)[1]]&&
                                                d.properties[Object.keys(checked)[2]]===checked[Object.keys(checked)[2]]&&
                                                d.properties[Object.keys(checked)[3]]===checked[Object.keys(checked)[3]]&&
                                                d.properties[Object.keys(checked)[4]]===checked[Object.keys(checked)[4]]&&
                                                d.properties[Object.keys(checked)[5]]===checked[Object.keys(checked)[5]]&&
                                                d.properties[Object.keys(checked)[6]]===checked[Object.keys(checked)[6]]&&
                                                d.properties[Object.keys(checked)[7]]===checked[Object.keys(checked)[7]]&&
                                                d.properties[Object.keys(checked)[8]]===checked[Object.keys(checked)[8]]&&
                                                d.properties[Object.keys(checked)[9]]===checked[Object.keys(checked)[9]]&&
                                                d.properties[Object.keys(checked)[10]]===checked[Object.keys(checked)[10]]&&
                                                d.properties[Object.keys(checked)[11]]===checked[Object.keys(checked)[11]]&&
                                                d.properties[Object.keys(checked)[12]]===checked[Object.keys(checked)[12]]&&
                                                d.properties[Object.keys(checked)[13]]===checked[Object.keys(checked)[13]]&&
                                                d.properties[Object.keys(checked)[14]]===checked[Object.keys(checked)[14]]))

                    dots.filter(d=>d.properties[Object.keys(checked)[0]]===checked[Object.keys(checked)[0]]&&
                                d.properties[Object.keys(checked)[1]]===checked[Object.keys(checked)[1]]&&
                                d.properties[Object.keys(checked)[2]]===checked[Object.keys(checked)[2]]&&
                                d.properties[Object.keys(checked)[3]]===checked[Object.keys(checked)[3]]&&
                                d.properties[Object.keys(checked)[4]]===checked[Object.keys(checked)[4]]&&
                                d.properties[Object.keys(checked)[5]]===checked[Object.keys(checked)[5]]&&
                                d.properties[Object.keys(checked)[6]]===checked[Object.keys(checked)[6]]&&
                                d.properties[Object.keys(checked)[7]]===checked[Object.keys(checked)[7]]&&
                                d.properties[Object.keys(checked)[8]]===checked[Object.keys(checked)[8]]&&
                                d.properties[Object.keys(checked)[9]]===checked[Object.keys(checked)[9]]&&
                                d.properties[Object.keys(checked)[10]]===checked[Object.keys(checked)[10]]&&
                                d.properties[Object.keys(checked)[11]]===checked[Object.keys(checked)[11]]&&
                                d.properties[Object.keys(checked)[12]]===checked[Object.keys(checked)[12]]&&
                                d.properties[Object.keys(checked)[13]]===checked[Object.keys(checked)[13]]&&
                                d.properties[Object.keys(checked)[14]]===checked[Object.keys(checked)[14]]).style("opacity", "0.7")
                
                } else if(Object.keys(checked).length===16) {
                    console.log(checked)
                    dots.style("opacity", "0.2")

                    console.log(dots.filter(d=>d.properties[Object.keys(checked)[0]]===checked[Object.keys(checked)[0]]&&
                                                d.properties[Object.keys(checked)[1]]===checked[Object.keys(checked)[1]]&&
                                                d.properties[Object.keys(checked)[2]]===checked[Object.keys(checked)[2]]&&
                                                d.properties[Object.keys(checked)[3]]===checked[Object.keys(checked)[3]]&&
                                                d.properties[Object.keys(checked)[4]]===checked[Object.keys(checked)[4]]&&
                                                d.properties[Object.keys(checked)[5]]===checked[Object.keys(checked)[5]]&&
                                                d.properties[Object.keys(checked)[6]]===checked[Object.keys(checked)[6]]&&
                                                d.properties[Object.keys(checked)[7]]===checked[Object.keys(checked)[7]]&&
                                                d.properties[Object.keys(checked)[8]]===checked[Object.keys(checked)[8]]&&
                                                d.properties[Object.keys(checked)[9]]===checked[Object.keys(checked)[9]]&&
                                                d.properties[Object.keys(checked)[10]]===checked[Object.keys(checked)[10]]&&
                                                d.properties[Object.keys(checked)[11]]===checked[Object.keys(checked)[11]]&&
                                                d.properties[Object.keys(checked)[12]]===checked[Object.keys(checked)[12]]&&
                                                d.properties[Object.keys(checked)[13]]===checked[Object.keys(checked)[13]]&&
                                                d.properties[Object.keys(checked)[14]]===checked[Object.keys(checked)[14]]&&
                                                d.properties[Object.keys(checked)[15]]===checked[Object.keys(checked)[15]]))

                    dots.filter(d=>d.properties[Object.keys(checked)[0]]===checked[Object.keys(checked)[0]]&&
                                d.properties[Object.keys(checked)[1]]===checked[Object.keys(checked)[1]]&&
                                d.properties[Object.keys(checked)[2]]===checked[Object.keys(checked)[2]]&&
                                d.properties[Object.keys(checked)[3]]===checked[Object.keys(checked)[3]]&&
                                d.properties[Object.keys(checked)[4]]===checked[Object.keys(checked)[4]]&&
                                d.properties[Object.keys(checked)[5]]===checked[Object.keys(checked)[5]]&&
                                d.properties[Object.keys(checked)[6]]===checked[Object.keys(checked)[6]]&&
                                d.properties[Object.keys(checked)[7]]===checked[Object.keys(checked)[7]]&&
                                d.properties[Object.keys(checked)[8]]===checked[Object.keys(checked)[8]]&&
                                d.properties[Object.keys(checked)[9]]===checked[Object.keys(checked)[9]]&&
                                d.properties[Object.keys(checked)[10]]===checked[Object.keys(checked)[10]]&&
                                d.properties[Object.keys(checked)[11]]===checked[Object.keys(checked)[11]]&&
                                d.properties[Object.keys(checked)[12]]===checked[Object.keys(checked)[12]]&&
                                d.properties[Object.keys(checked)[13]]===checked[Object.keys(checked)[13]]&&
                                d.properties[Object.keys(checked)[14]]===checked[Object.keys(checked)[14]]&&
                                d.properties[Object.keys(checked)[15]]===checked[Object.keys(checked)[15]]).style("opacity", "0.7")
                
                } else if(Object.keys(checked).length===17) {
                    console.log(checked)
                    dots.style("opacity", "0.2")

                    console.log(dots.filter(d=>d.properties[Object.keys(checked)[0]]===checked[Object.keys(checked)[0]]&&
                                                d.properties[Object.keys(checked)[1]]===checked[Object.keys(checked)[1]]&&
                                                d.properties[Object.keys(checked)[2]]===checked[Object.keys(checked)[2]]&&
                                                d.properties[Object.keys(checked)[3]]===checked[Object.keys(checked)[3]]&&
                                                d.properties[Object.keys(checked)[4]]===checked[Object.keys(checked)[4]]&&
                                                d.properties[Object.keys(checked)[5]]===checked[Object.keys(checked)[5]]&&
                                                d.properties[Object.keys(checked)[6]]===checked[Object.keys(checked)[6]]&&
                                                d.properties[Object.keys(checked)[7]]===checked[Object.keys(checked)[7]]&&
                                                d.properties[Object.keys(checked)[8]]===checked[Object.keys(checked)[8]]&&
                                                d.properties[Object.keys(checked)[9]]===checked[Object.keys(checked)[9]]&&
                                                d.properties[Object.keys(checked)[10]]===checked[Object.keys(checked)[10]]&&
                                                d.properties[Object.keys(checked)[11]]===checked[Object.keys(checked)[11]]&&
                                                d.properties[Object.keys(checked)[12]]===checked[Object.keys(checked)[12]]&&
                                                d.properties[Object.keys(checked)[13]]===checked[Object.keys(checked)[13]]&&
                                                d.properties[Object.keys(checked)[14]]===checked[Object.keys(checked)[14]]&&
                                                d.properties[Object.keys(checked)[15]]===checked[Object.keys(checked)[15]]&&
                                                d.properties[Object.keys(checked)[16]]===checked[Object.keys(checked)[16]]))

                    dots.filter(d=>d.properties[Object.keys(checked)[0]]===checked[Object.keys(checked)[0]]&&
                                d.properties[Object.keys(checked)[1]]===checked[Object.keys(checked)[1]]&&
                                d.properties[Object.keys(checked)[2]]===checked[Object.keys(checked)[2]]&&
                                d.properties[Object.keys(checked)[3]]===checked[Object.keys(checked)[3]]&&
                                d.properties[Object.keys(checked)[4]]===checked[Object.keys(checked)[4]]&&
                                d.properties[Object.keys(checked)[5]]===checked[Object.keys(checked)[5]]&&
                                d.properties[Object.keys(checked)[6]]===checked[Object.keys(checked)[6]]&&
                                d.properties[Object.keys(checked)[7]]===checked[Object.keys(checked)[7]]&&
                                d.properties[Object.keys(checked)[8]]===checked[Object.keys(checked)[8]]&&
                                d.properties[Object.keys(checked)[9]]===checked[Object.keys(checked)[9]]&&
                                d.properties[Object.keys(checked)[10]]===checked[Object.keys(checked)[10]]&&
                                d.properties[Object.keys(checked)[11]]===checked[Object.keys(checked)[11]]&&
                                d.properties[Object.keys(checked)[12]]===checked[Object.keys(checked)[12]]&&
                                d.properties[Object.keys(checked)[13]]===checked[Object.keys(checked)[13]]&&
                                d.properties[Object.keys(checked)[14]]===checked[Object.keys(checked)[14]]&&
                                d.properties[Object.keys(checked)[15]]===checked[Object.keys(checked)[15]]&&
                                d.properties[Object.keys(checked)[16]]===checked[Object.keys(checked)[16]]).style("opacity", "0.7")
                
                } else if(Object.keys(checked).length===18) {
                    console.log(checked)
                    dots.style("opacity", "0.2")

                    console.log(dots.filter(d=>d.properties[Object.keys(checked)[0]]===checked[Object.keys(checked)[0]]&&
                                                d.properties[Object.keys(checked)[1]]===checked[Object.keys(checked)[1]]&&
                                                d.properties[Object.keys(checked)[2]]===checked[Object.keys(checked)[2]]&&
                                                d.properties[Object.keys(checked)[3]]===checked[Object.keys(checked)[3]]&&
                                                d.properties[Object.keys(checked)[4]]===checked[Object.keys(checked)[4]]&&
                                                d.properties[Object.keys(checked)[5]]===checked[Object.keys(checked)[5]]&&
                                                d.properties[Object.keys(checked)[6]]===checked[Object.keys(checked)[6]]&&
                                                d.properties[Object.keys(checked)[7]]===checked[Object.keys(checked)[7]]&&
                                                d.properties[Object.keys(checked)[8]]===checked[Object.keys(checked)[8]]&&
                                                d.properties[Object.keys(checked)[9]]===checked[Object.keys(checked)[9]]&&
                                                d.properties[Object.keys(checked)[10]]===checked[Object.keys(checked)[10]]&&
                                                d.properties[Object.keys(checked)[11]]===checked[Object.keys(checked)[11]]&&
                                                d.properties[Object.keys(checked)[12]]===checked[Object.keys(checked)[12]]&&
                                                d.properties[Object.keys(checked)[13]]===checked[Object.keys(checked)[13]]&&
                                                d.properties[Object.keys(checked)[14]]===checked[Object.keys(checked)[14]]&&
                                                d.properties[Object.keys(checked)[15]]===checked[Object.keys(checked)[15]]&&
                                                d.properties[Object.keys(checked)[16]]===checked[Object.keys(checked)[16]]&&
                                                d.properties[Object.keys(checked)[17]]===checked[Object.keys(checked)[17]]))

                    dots.filter(d=>d.properties[Object.keys(checked)[0]]===checked[Object.keys(checked)[0]]&&
                                d.properties[Object.keys(checked)[1]]===checked[Object.keys(checked)[1]]&&
                                d.properties[Object.keys(checked)[2]]===checked[Object.keys(checked)[2]]&&
                                d.properties[Object.keys(checked)[3]]===checked[Object.keys(checked)[3]]&&
                                d.properties[Object.keys(checked)[4]]===checked[Object.keys(checked)[4]]&&
                                d.properties[Object.keys(checked)[5]]===checked[Object.keys(checked)[5]]&&
                                d.properties[Object.keys(checked)[6]]===checked[Object.keys(checked)[6]]&&
                                d.properties[Object.keys(checked)[7]]===checked[Object.keys(checked)[7]]&&
                                d.properties[Object.keys(checked)[8]]===checked[Object.keys(checked)[8]]&&
                                d.properties[Object.keys(checked)[9]]===checked[Object.keys(checked)[9]]&&
                                d.properties[Object.keys(checked)[10]]===checked[Object.keys(checked)[10]]&&
                                d.properties[Object.keys(checked)[11]]===checked[Object.keys(checked)[11]]&&
                                d.properties[Object.keys(checked)[12]]===checked[Object.keys(checked)[12]]&&
                                d.properties[Object.keys(checked)[13]]===checked[Object.keys(checked)[13]]&&
                                d.properties[Object.keys(checked)[14]]===checked[Object.keys(checked)[14]]&&
                                d.properties[Object.keys(checked)[15]]===checked[Object.keys(checked)[15]]&&
                                d.properties[Object.keys(checked)[16]]===checked[Object.keys(checked)[16]]&&
                                d.properties[Object.keys(checked)[17]]===checked[Object.keys(checked)[17]]).style("opacity", "0.7")
                
                } else if(Object.keys(checked).length===19) {
                    console.log(checked)
                    dots.style("opacity", "0.2")

                    console.log(dots.filter(d=>d.properties[Object.keys(checked)[0]]===checked[Object.keys(checked)[0]]&&
                                                d.properties[Object.keys(checked)[1]]===checked[Object.keys(checked)[1]]&&
                                                d.properties[Object.keys(checked)[2]]===checked[Object.keys(checked)[2]]&&
                                                d.properties[Object.keys(checked)[3]]===checked[Object.keys(checked)[3]]&&
                                                d.properties[Object.keys(checked)[4]]===checked[Object.keys(checked)[4]]&&
                                                d.properties[Object.keys(checked)[5]]===checked[Object.keys(checked)[5]]&&
                                                d.properties[Object.keys(checked)[6]]===checked[Object.keys(checked)[6]]&&
                                                d.properties[Object.keys(checked)[7]]===checked[Object.keys(checked)[7]]&&
                                                d.properties[Object.keys(checked)[8]]===checked[Object.keys(checked)[8]]&&
                                                d.properties[Object.keys(checked)[9]]===checked[Object.keys(checked)[9]]&&
                                                d.properties[Object.keys(checked)[10]]===checked[Object.keys(checked)[10]]&&
                                                d.properties[Object.keys(checked)[11]]===checked[Object.keys(checked)[11]]&&
                                                d.properties[Object.keys(checked)[12]]===checked[Object.keys(checked)[12]]&&
                                                d.properties[Object.keys(checked)[13]]===checked[Object.keys(checked)[13]]&&
                                                d.properties[Object.keys(checked)[14]]===checked[Object.keys(checked)[14]]&&
                                                d.properties[Object.keys(checked)[15]]===checked[Object.keys(checked)[15]]&&
                                                d.properties[Object.keys(checked)[16]]===checked[Object.keys(checked)[16]]&&
                                                d.properties[Object.keys(checked)[17]]===checked[Object.keys(checked)[17]]&&
                                                d.properties[Object.keys(checked)[18]]===checked[Object.keys(checked)[18]]))

                    dots.filter(d=>d.properties[Object.keys(checked)[0]]===checked[Object.keys(checked)[0]]&&
                                d.properties[Object.keys(checked)[1]]===checked[Object.keys(checked)[1]]&&
                                d.properties[Object.keys(checked)[2]]===checked[Object.keys(checked)[2]]&&
                                d.properties[Object.keys(checked)[3]]===checked[Object.keys(checked)[3]]&&
                                d.properties[Object.keys(checked)[4]]===checked[Object.keys(checked)[4]]&&
                                d.properties[Object.keys(checked)[5]]===checked[Object.keys(checked)[5]]&&
                                d.properties[Object.keys(checked)[6]]===checked[Object.keys(checked)[6]]&&
                                d.properties[Object.keys(checked)[7]]===checked[Object.keys(checked)[7]]&&
                                d.properties[Object.keys(checked)[8]]===checked[Object.keys(checked)[8]]&&
                                d.properties[Object.keys(checked)[9]]===checked[Object.keys(checked)[9]]&&
                                d.properties[Object.keys(checked)[10]]===checked[Object.keys(checked)[10]]&&
                                d.properties[Object.keys(checked)[11]]===checked[Object.keys(checked)[11]]&&
                                d.properties[Object.keys(checked)[12]]===checked[Object.keys(checked)[12]]&&
                                d.properties[Object.keys(checked)[13]]===checked[Object.keys(checked)[13]]&&
                                d.properties[Object.keys(checked)[14]]===checked[Object.keys(checked)[14]]&&
                                d.properties[Object.keys(checked)[15]]===checked[Object.keys(checked)[15]]&&
                                d.properties[Object.keys(checked)[16]]===checked[Object.keys(checked)[16]]&&
                                d.properties[Object.keys(checked)[17]]===checked[Object.keys(checked)[17]]&&
                                d.properties[Object.keys(checked)[18]]===checked[Object.keys(checked)[18]]).style("opacity", "0.7")
                
                } else if(Object.keys(checked).length===20) {
                    console.log(checked)
                    dots.style("opacity", "0.2")

                    console.log(dots.filter(d=>d.properties[Object.keys(checked)[0]]===checked[Object.keys(checked)[0]]&&
                                                d.properties[Object.keys(checked)[1]]===checked[Object.keys(checked)[1]]&&
                                                d.properties[Object.keys(checked)[2]]===checked[Object.keys(checked)[2]]&&
                                                d.properties[Object.keys(checked)[3]]===checked[Object.keys(checked)[3]]&&
                                                d.properties[Object.keys(checked)[4]]===checked[Object.keys(checked)[4]]&&
                                                d.properties[Object.keys(checked)[5]]===checked[Object.keys(checked)[5]]&&
                                                d.properties[Object.keys(checked)[6]]===checked[Object.keys(checked)[6]]&&
                                                d.properties[Object.keys(checked)[7]]===checked[Object.keys(checked)[7]]&&
                                                d.properties[Object.keys(checked)[8]]===checked[Object.keys(checked)[8]]&&
                                                d.properties[Object.keys(checked)[9]]===checked[Object.keys(checked)[9]]&&
                                                d.properties[Object.keys(checked)[10]]===checked[Object.keys(checked)[10]]&&
                                                d.properties[Object.keys(checked)[11]]===checked[Object.keys(checked)[11]]&&
                                                d.properties[Object.keys(checked)[12]]===checked[Object.keys(checked)[12]]&&
                                                d.properties[Object.keys(checked)[13]]===checked[Object.keys(checked)[13]]&&
                                                d.properties[Object.keys(checked)[14]]===checked[Object.keys(checked)[14]]&&
                                                d.properties[Object.keys(checked)[15]]===checked[Object.keys(checked)[15]]&&
                                                d.properties[Object.keys(checked)[16]]===checked[Object.keys(checked)[16]]&&
                                                d.properties[Object.keys(checked)[17]]===checked[Object.keys(checked)[17]]&&
                                                d.properties[Object.keys(checked)[18]]===checked[Object.keys(checked)[18]]&&
                                                d.properties[Object.keys(checked)[19]]===checked[Object.keys(checked)[19]]))

                    dots.filter(d=>d.properties[Object.keys(checked)[0]]===checked[Object.keys(checked)[0]]&&
                                d.properties[Object.keys(checked)[1]]===checked[Object.keys(checked)[1]]&&
                                d.properties[Object.keys(checked)[2]]===checked[Object.keys(checked)[2]]&&
                                d.properties[Object.keys(checked)[3]]===checked[Object.keys(checked)[3]]&&
                                d.properties[Object.keys(checked)[4]]===checked[Object.keys(checked)[4]]&&
                                d.properties[Object.keys(checked)[5]]===checked[Object.keys(checked)[5]]&&
                                d.properties[Object.keys(checked)[6]]===checked[Object.keys(checked)[6]]&&
                                d.properties[Object.keys(checked)[7]]===checked[Object.keys(checked)[7]]&&
                                d.properties[Object.keys(checked)[8]]===checked[Object.keys(checked)[8]]&&
                                d.properties[Object.keys(checked)[9]]===checked[Object.keys(checked)[9]]&&
                                d.properties[Object.keys(checked)[10]]===checked[Object.keys(checked)[10]]&&
                                d.properties[Object.keys(checked)[11]]===checked[Object.keys(checked)[11]]&&
                                d.properties[Object.keys(checked)[12]]===checked[Object.keys(checked)[12]]&&
                                d.properties[Object.keys(checked)[13]]===checked[Object.keys(checked)[13]]&&
                                d.properties[Object.keys(checked)[14]]===checked[Object.keys(checked)[14]]&&
                                d.properties[Object.keys(checked)[15]]===checked[Object.keys(checked)[15]]&&
                                d.properties[Object.keys(checked)[16]]===checked[Object.keys(checked)[16]]&&
                                d.properties[Object.keys(checked)[17]]===checked[Object.keys(checked)[17]]&&
                                d.properties[Object.keys(checked)[18]]===checked[Object.keys(checked)[18]]&&
                                d.properties[Object.keys(checked)[19]]===checked[Object.keys(checked)[19]]).style("opacity", "0.7")
                
                } else if(Object.keys(checked).length===21) {
                    console.log(checked)
                    dots.style("opacity", "0.2")

                    console.log(dots.filter(d=>d.properties[Object.keys(checked)[0]]===checked[Object.keys(checked)[0]]&&
                                                d.properties[Object.keys(checked)[1]]===checked[Object.keys(checked)[1]]&&
                                                d.properties[Object.keys(checked)[2]]===checked[Object.keys(checked)[2]]&&
                                                d.properties[Object.keys(checked)[3]]===checked[Object.keys(checked)[3]]&&
                                                d.properties[Object.keys(checked)[4]]===checked[Object.keys(checked)[4]]&&
                                                d.properties[Object.keys(checked)[5]]===checked[Object.keys(checked)[5]]&&
                                                d.properties[Object.keys(checked)[6]]===checked[Object.keys(checked)[6]]&&
                                                d.properties[Object.keys(checked)[7]]===checked[Object.keys(checked)[7]]&&
                                                d.properties[Object.keys(checked)[8]]===checked[Object.keys(checked)[8]]&&
                                                d.properties[Object.keys(checked)[9]]===checked[Object.keys(checked)[9]]&&
                                                d.properties[Object.keys(checked)[10]]===checked[Object.keys(checked)[10]]&&
                                                d.properties[Object.keys(checked)[11]]===checked[Object.keys(checked)[11]]&&
                                                d.properties[Object.keys(checked)[12]]===checked[Object.keys(checked)[12]]&&
                                                d.properties[Object.keys(checked)[13]]===checked[Object.keys(checked)[13]]&&
                                                d.properties[Object.keys(checked)[14]]===checked[Object.keys(checked)[14]]&&
                                                d.properties[Object.keys(checked)[15]]===checked[Object.keys(checked)[15]]&&
                                                d.properties[Object.keys(checked)[16]]===checked[Object.keys(checked)[16]]&&
                                                d.properties[Object.keys(checked)[17]]===checked[Object.keys(checked)[17]]&&
                                                d.properties[Object.keys(checked)[18]]===checked[Object.keys(checked)[18]]&&
                                                d.properties[Object.keys(checked)[19]]===checked[Object.keys(checked)[19]]&&
                                                d.properties[Object.keys(checked)[20]]===checked[Object.keys(checked)[20]]))

                    dots.filter(d=>d.properties[Object.keys(checked)[0]]===checked[Object.keys(checked)[0]]&&
                                d.properties[Object.keys(checked)[1]]===checked[Object.keys(checked)[1]]&&
                                d.properties[Object.keys(checked)[2]]===checked[Object.keys(checked)[2]]&&
                                d.properties[Object.keys(checked)[3]]===checked[Object.keys(checked)[3]]&&
                                d.properties[Object.keys(checked)[4]]===checked[Object.keys(checked)[4]]&&
                                d.properties[Object.keys(checked)[5]]===checked[Object.keys(checked)[5]]&&
                                d.properties[Object.keys(checked)[6]]===checked[Object.keys(checked)[6]]&&
                                d.properties[Object.keys(checked)[7]]===checked[Object.keys(checked)[7]]&&
                                d.properties[Object.keys(checked)[8]]===checked[Object.keys(checked)[8]]&&
                                d.properties[Object.keys(checked)[9]]===checked[Object.keys(checked)[9]]&&
                                d.properties[Object.keys(checked)[10]]===checked[Object.keys(checked)[10]]&&
                                d.properties[Object.keys(checked)[11]]===checked[Object.keys(checked)[11]]&&
                                d.properties[Object.keys(checked)[12]]===checked[Object.keys(checked)[12]]&&
                                d.properties[Object.keys(checked)[13]]===checked[Object.keys(checked)[13]]&&
                                d.properties[Object.keys(checked)[14]]===checked[Object.keys(checked)[14]]&&
                                d.properties[Object.keys(checked)[15]]===checked[Object.keys(checked)[15]]&&
                                d.properties[Object.keys(checked)[16]]===checked[Object.keys(checked)[16]]&&
                                d.properties[Object.keys(checked)[17]]===checked[Object.keys(checked)[17]]&&
                                d.properties[Object.keys(checked)[18]]===checked[Object.keys(checked)[18]]&&
                                d.properties[Object.keys(checked)[19]]===checked[Object.keys(checked)[19]]&&
                                d.properties[Object.keys(checked)[20]]===checked[Object.keys(checked)[20]]).style("opacity", "0.7")
                
                }
            }
        )
    }

    // checkDots = dots
    function filterCheckOld2() {
        d3.selectAll(".check").each(function(d){
        // d3.selectAll("input[class=check]").on("change", function() {
            cb = d3.select(this);
            grp = cb.property("value")
            id = cb.property("id")

            // If the box is check, I show the group
            if(cb.property("checked")){
            //   svg.selectAll("."+grp).transition().duration(1000).style("opacity", 1).attr("r", function(d){ return size(d.size) })
            // console.log(grp)
            // console.log(id)
            checked[id] = grp
            console.log(checked)
            console.log(Object.keys(checked)[0])
            console.log(Object.keys(checked)[1])


            dots.style("opacity", "0.2")

            // console.log(dots.filter(d=>d.properties[id]===checked[id]))

            uncheckDots = checkDots.filter(d=>d.properties[id]!==checked[id])
            checkDots = checkDots.filter(d=>d.properties[id]===checked[id])

            console.log(checkDots)

            checkDots.style("opacity", "0.7")

            // console.log()

            // Otherwise I hide it
            }else{

                // checkDots = checkDots.merge(dots.filter(d=>d.properties[id]!==checked[id]))
                uncheckDots.style("opacity", "0.7")
                
            //   svg.selectAll("."+grp).transition().duration(1000).style("opacity", 0).attr("r", 0)
            }
        })
    }

    function filterCheckOld() {
        d3.selectAll(".check").each(function(d){
        // d3.selectAll("input[class=check]").on("change", function() {
            cb = d3.select(this);
            grp = cb.property("value")
            id = cb.property("id")

            // If the box is check, I show the group
            if(cb.property("checked")){
            //   svg.selectAll("."+grp).transition().duration(1000).style("opacity", 1).attr("r", function(d){ return size(d.size) })
            // console.log(grp)
            // console.log(id)
            checked[id] = grp
            console.log(checked)
            console.log(Object.keys(checked))


            dots.style("opacity", "0.2")

            console.log(dots.filter(d=>d.properties[id]===checked[id]))

            // console.log(dots.filter(d=>(d.properties["BIPOC Run"]===checked["BIPOC Run"])&&
            //                            (d.properties["Breakfast"]===checked["Breakfast"])&&
            //                            (d.properties["Delivery"]===checked["Delivery"])&&
            //                            (d.properties["Dessert"]===checked["Dessert"])&&
            //                            (d.properties["Dine-In"]===checked["Dine-In"])&&
            //                            (d.properties["Dinner"]===checked["Dinner"])&&
            //                            (d.properties["Halal"]===checked["Halal"])&&
            //                            (d.properties["Kosher"]===checked["Kosher"])&&
            //                            (d.properties["Late Night"]===checked["Late Night"])&&
            //                            (d.properties["Lunch"]===checked["Lunch"])&&
            //                            (d.properties["Take-out"]===checked["Take-out"])&&
            //                            (d.properties["Vegan"]===checked["Vegan"])&&
            //                            (d.properties["Vegetarian"]===checked["Vegetarian"])&&
            //                            (d.properties["Women Run"]===checked["Women Run"])))

            // dots.filter(d=>(d.properties["BIPOC Run"]===checked["BIPOC Run"])&&
            //                 (d.properties["Breakfast"]===checked["Breakfast"])&&
            //                 (d.properties["Delivery"]===checked["Delivery"])&&
            //                 (d.properties["Dessert"]===checked["Dessert"])&&
            //                 (d.properties["Dine-In"]===checked["Dine-In"])&&
            //                 (d.properties["Dinner"]===checked["Dinner"])&&
            //                 (d.properties["Halal"]===checked["Halal"])&&
            //                 (d.properties["Kosher"]===checked["Kosher"])&&
            //                 (d.properties["Late Night"]===checked["Late Night"])&&
            //                 (d.properties["Lunch"]===checked["Lunch"])&&
            //                 (d.properties["Take-out"]===checked["Take-out"])&&
            //                 (d.properties["Vegan"]===checked["Vegan"])&&
            //                 (d.properties["Vegetarian"]===checked["Vegetarian"])&&
            //                 (d.properties["Women Run"]===checked["Women Run"])).style("opacity", "0.7")

            dots.filter(d=>d.properties[id]===checked[id]).style("opacity", "0.7")


            




            // console.log()

            // Otherwise I hide it
            }else{
            //   svg.selectAll("."+grp).transition().duration(1000).style("opacity", 0).attr("r", 0)
            }
        })
    }

    d3.selectAll(".check").on("change", filterCheck);
}

function showtooltip(d, i) {
    let el = d3.select("body");
    
    // el
    //   .transition()
    //   .duration(100)
    //   .style("opacity", 0.9)
    
    let div = el
        .append("g")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
  
    div
        .html(
        `<b>${d.properties['Business Name']}</b><br>
         <b>Chapter:</b> ${d.properties.Chapter}<br>
         <b>Address: </b>${d.properties['Address']}`
      )
        .style("opacity", 0.9)
        .style("left", (d3.event.pageX + 10) + "px")
        .style("top", (d3.event.pageY + 10) + "px");
    
    console.log(d3.selectAll("circle"))
    // console.log(d3.selectAll(".bronze"))
    // console.log(d.properties.Award)
    console.log(d3.selectAll("circle")
                  .filter(d=>d.properties.Vegetarian==="1"))

}

function hidetooltip(d, i) {
    let el = d3.selectAll(".tooltip");
    
     el.each(function() {
          el.remove();
      }); 
  
}

function click(d){
    
    let el = d3.selectAll(".clictip");
    
     el.each(function() {
          el.remove();
      }); 
    el = d3.select("div#map");
    
    el
      .transition()
      .duration(100)
      .style("opacity", 0.9)
    
    let div = el
        .append("g")
        .append("div")
        .attr("class", "clictip")
        .style("opacity", 1);
    div
        .html(
        `<div class="tipHeader"><h2 style="color:#f3f3f2" class="resName"><b>${d.properties['Business Name']}</b></h2></div><br>
         <img class="restImg" src=${d.properties['Photo'][0]['thumbnails']['full']['url']} alt="" v-if="${d.properties['Photo']}"><br>
         ${d.properties['Description']}<br><br>         
         <div class="category"> <b>Order Options: </b> 
         ${+d.properties['Dine-In']===1?" dine-in,":""}
         ${+d.properties['Take-out']===1?" take-out,":""}
         ${+d.properties['Delivery']===1?" delivery,":""}
         </div>
         <div class="category"> <b>Dietary Restrictions: </b> 
         ${+d.properties['Vegan']===1?" vegan,":""}
         ${+d.properties['Vegetarian']===1?" vegetarian,":""}
         ${+d.properties['Halal']===1?" halal,":""}
         ${+d.properties['Kosher']===1?" kosher":""}

         </div>
         ${+d.properties['BIPOC Run']===0?" ":"<b>BIPOC Run </b> "}
         <br> 
         ${+d.properties['Women Run']===0?" ": "<b>Womxn Run </b> "}
         <br><br>
         
         <div class="tipFooter""> <b>Address: </b>${d.properties['Address']}<br>
         <b>Phone Number: </b>${d.properties['Phone']}<br>
         ${d.properties['Website URL']==="0"?"": "</b><a class='url' href="+ '"' + d.properties['Website URL']+'"'+" target='_blank'><b>website</b></a><br>"}

         ${d.properties['Facebook URL']==="0"?"": "</b><a class='url' href="+ '"' + d.properties['Facebook URL']+'"'+" target='_blank'><b>facebook</b></a><br>"}
         ${d.properties['Instagram URL']==="0"?"": "</b><a class='url' href="+ '"' + d.properties['Instagram URL']+'"'+" target='_blank'><b>instagram</b></a><br>"}
         ${d.properties['Twitter URL']==="0"?"": "</b><a class='url' href="+ '"' + d.properties['Twitter URL']+'"'+" target='_blank'><b>twitter</b></a><br>"}
  </div>`
      
      )
        .style("opacity", 0.9)
        
}

function hideclicktip(d, i) {
    let el = d3.selectAll(".clictip");
    
     el.each(function() {
          el.remove();
      });

}
