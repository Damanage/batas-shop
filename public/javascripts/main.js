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
        
        var geoBtn = new ymaps.control.GeolocationControl({
            data: {
                image: 'images/baloon.jpg'
            },
            options: {
                noPlacemark: false,
                float: 'right',
                maxWidth: 50
            }
        });
        
        // Пример 2.
        // Создание кнопки с пользовательским макетом
        var button = new ymaps.control.Button({
                data: {
                    //content: '<div class="myButton"> <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><path fill="none" stroke="#262626" stroke-width="2" d="M14.047 2.17l-2.91 15.382-2.21-3.79c-.457-.783-1.45-1.358-2.358-1.362l-4.389-.02L14.047 2.17z"></path></svg></div>',
                    content: '<div class="myButton" style = "width: 100px; height: 100px"></div>',
                    title: 'Определить моё местоположение'
                },
                options: {
                    // layout: ymaps.templateLayoutFactory.createClass(
                    //     // Если кнопка не нажата, к ней применится css-стиль 'myButton'
                    //     // Если кнопка нажата, к ней применятся css-стили 'myButton' и 'myButtonSelected'.
                    //     "<div class='myButton {% if state.selected %}myButtonSelected{% endif %}' title='{{ data.title }}'>" +
                    //     "{{ data.content }}" +
                    //     "</div>"
                    // ),
                    // Чтобы другие элементы управления корректно позиционировались по горизонтали,
                    // нужно обязательно задать максимальную ширину для макета.
                    maxWidth: 150,
                    float: 'none', 
                    position: {left: '5px', top: '5px'}
                }});
        //map.controls.add(button, { float: 'left', floatIndex: 0 });
        
        // Можно задать позиционирование относительно краев карты. В этом случае
        // значение опции maxWidth не влияет на позиционирование
        // элементов управления.
        //map.controls.add(button, { float: 'none', position: {left: '5px', top: '5px'} });
        
        console.log (geoBtn);
        
        myMap = new ymaps.Map('map', {
                center: mypos,
                zoom: 12
                //,controls: ["smallMapDefaultSet"]
                , controls: [
                    geoBtn,
                    button
                ]
            }, {
                autoFitToViewport: 'always',
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
        objectManager.objects.options.set('preset', 'islands#blueDotIcon');
        objectManager.clusters.options.set('preset', 'islands#blueClusterIcons');
        myMap.geoObjects.add(objectManager);
    
        $.ajax({
            method: "GET",
            url: "/pub"
        }).done(function(data) {
            
            function templBody (rowid, value) {
                var html = "<font size=10><p>";
                    html += value.properties.product;
                    html += ": " + value.properties.comments;
                    html += "</p>" + "</font>";
                    html += "<font size=10><p>" 
                        + "<input id='" + rowid + "' type = 'button' class = 'buyButton' value = 'Купить' onclick = buyProduct(this.id)>"
                        + "</p></font>";
                return html;
            }
            
            function templHeader (value) {
                var html = "<font size=10><b>" 
                        + value.properties.product 
                        +"</b> по цене " 
                        + value.properties.price 
                        + " " 
                        + value.properties.currency
                        + "</font>";
                
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
            
            ymaps.geolocation.get({
                provider: 'auto',
                mapStateAutoApply: false
            }).then(function (result) {
                myMap.geoObjects.add(result.geoObjects);
            });
        });
    }
    
    function fullReload () {
        
        
        //var chain = geoFindMe();
        
        var chain = Promise.resolve([-8.354994, 115.115268]);
    
        chain.then (
            function (pos) {
                mypos = pos;
                ymaps.ready(init);
            }
        );
        
    }
    
    fullReload();
});