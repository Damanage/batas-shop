$(document).ready(function() {
    
    var path = window.location.pathname;
    var prodid = path.split('/')[2];
    
    $.ajax({
        method: "GET",
        url: "/getproduct/" + prodid
    }).done(function(data) {
        $('#prvdesc').append(data.message.prv.desc);
        $('#prvnotes').append(data.message.prv.notes);
        
        for (var file in data.message.prv._attachments) {
            var foto = "<p><img src=/photo/" + prodid + '/' + file +'></p>'
            $('#photos').append(foto);
        }
        
        ymaps.ready(function() {
            
            var mypos = [data.message.pub.geometry.coordinates[1], data.message.pub.geometry.coordinates[0]];
            
            var myMap = new ymaps.Map('map', {
                center: mypos,
                zoom: 12,
                controls: ["smallMapDefaultSet"]
            }, {
                searchControlProvider: 'yandex#search'
            });
            
            var myGeoObject = new ymaps.GeoObject({
                // Описание геометрии.
                geometry: {
                    type: "Point",
                    coordinates: mypos
                },
                // Свойства.
                properties: {
                    // Контент метки.
                    iconContent: data.message.pub.properties.product,
                    hintContent: data.message.pub.properties.comments
                }
            }, {
                // Опции.
                // Иконка метки будет растягиваться под размер ее содержимого.
                preset: 'islands#blueStretchyIcon'
            });
            
            myMap.geoObjects.add(myGeoObject);
            
            
        });
        
        });
});