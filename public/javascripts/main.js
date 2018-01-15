function buyProduct (prodid) {
    console.log(prodid);
    
    $.ajax({
        method: "GET",
        url: "/buy/" + prodid
    }).done(function(data) {
       location.href = data.url;
    });
}

$(document).ready(function() {
    var myMap;
    var mypos = [-8.354994, 115.115268];
    
    function geoFindMe() {
        return new Promise (function(resolve, reject){
            if (!navigator.geolocation){
                console.log ("Geolocation is not supported by your browser");
                resolve (mypos);
            }
            else {
              navigator.geolocation.getCurrentPosition(
                  function(position){
                    var latitude  = position.coords.latitude;
                    var longitude = position.coords.longitude;
                    output = [latitude,longitude];
                    resolve(output);
                  }, 
                  function(err) {
                      console.log ("Unable to retrieve your location: " + err.message);
                      resolve (mypos);
                  });
            }
    });
    }
    
    function init () {
        myMap = new ymaps.Map('map', {
                center: mypos,
                zoom: 12,
                controls: ["smallMapDefaultSet"]
            }, {
                searchControlProvider: 'yandex#search'
            }),
            objectManager = new ymaps.ObjectManager({
                // Чтобы метки начали кластеризоваться, выставляем опцию.
                clusterize: true,
                // ObjectManager принимает те же опции, что и кластеризатор.
                gridSize: 32,
                clusterDisableClickZoom: true
            });
    
        // Чтобы задать опции одиночным объектам и кластерам,
        // обратимся к дочерним коллекциям ObjectManager.
        objectManager.objects.options.set('preset', 'islands#greenDotIcon');
        objectManager.clusters.options.set('preset', 'islands#greenClusterIcons');
        myMap.geoObjects.add(objectManager);
    
        $.ajax({
            method: "GET",
            url: "/pub"
        }).done(function(data) {
            
            function templBody (rowid, value) {
                var html = "<p>";
                    html += value.properties.product;
                    html += ": " + value.properties.comments;
                    html += "</p>";
                    html += "<p>" 
                        + "<input id='" + rowid + "' type = 'button' class = 'buyButton' value = 'Купить' onclick = buyProduct(this.id)>"
                        + "</p>";
                return html;
            }
            
            function templHeader (value) {
                var html = "<font size=3><b>" 
                        + value.properties.product 
                        +"</b></font> по цене " 
                        + value.properties.price 
                        + " " 
                        + value.properties.currency;
                
                return html;
            }
            
            function templFooter (value) {
                var html = "<font size=1>Товар спрятан и бережно упакован командой Battery AutoShop</font>";
                
                return html;
            }
            
            function templHint (value) {
                var html = value.properties.product;
                
                return html;
            }
            
            var r = {
                "type": "FeatureCollection",
                "features": []
            };
            
            for (var d in data.rows) {
                r.features.push ({
                    "type": "Battery", 
                    "id": data.rows[d].id, 
                    "geometry": 
                        {"type": "Point", "coordinates": [data.rows[d].value.geometry.coordinates[1], data.rows[d].value.geometry.coordinates[0]]}, 
                    "properties": 
                    {
                        "balloonContentHeader":templHeader(data.rows[d].value), 
                        "balloonContentBody": templBody(data.rows[d].id, data.rows[d].value),
                        "balloonContentFooter": templFooter(data.rows[d].value), 
                        "clusterCaption": templHeader(data.rows[d].value), 
                        "hintContent": templHint(data.rows[d].value)
                    }
                });                            
            }

            objectManager.add(r);
        });
    }
    
    function fullReload () {
        
        
        var chain = geoFindMe();
    
        chain.then (
            function (pos) {
                mypos = pos;
                ymaps.ready(init);
            }
        );
    }
    
    fullReload();
});