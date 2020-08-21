"use strict"

let r;
let r2;
let r3;
let r4;
let r5;
let r6;
let sugas2 = [];
let koki2 = [];
let organismi2 = [];
let aktuObjekts = {};
let parauguObjekts = {};
let kokuObjekts = {};


require([
  "esri/Map",
  "esri/views/MapView",
  "esri/request",
  "esri/layers/GraphicsLayer",
  "esri/Graphic", 
  "esri/geometry/support/webMercatorUtils",
  "esri/layers/FeatureLayer"
], function(Map, MapView, Request, GraphicsLayer, Graphic, webMercatorUtils, FeatureLayer) {

let map = new Map({
  basemap: "gray"
});

let view = new MapView({
  container: "viewDiv",
  map: map,
  center: [24.23308, 56.96001], // longitude, latitude 
  zoom: 7
});

const novaduSlanis = new FeatureLayer({
  url: "https://services1.arcgis.com/qbu95DaOMntesDTa/arcgis/rest/services/novadi_LV/FeatureServer/0"
});

const graphicsLayer = new GraphicsLayer();
const graphicsLayer2 = new GraphicsLayer();
const graphicsLayer3 = new GraphicsLayer();
  map.add(graphicsLayer);
  map.add(graphicsLayer2);
  map.add(graphicsLayer3);

//2019.gada paraugi
//const paraugiURL = "https://services1.arcgis.com/3dWrAGXGF8L1iW48/arcgis/rest/services/akd_mezuparb_paraugi2019jan_dec/FeatureServer/0/query?token=1x6jrQouWBYx1kCYkoVQ53RFft8jBSWO83OR1PFr_DKcQxzePfNniwk5I-XHHpB1YdG98YXVwNhwbF1IpQW78GHPuBnWlEBAdOYuV2xyyYG-FS1dxXaR5CWzMtuiLxh_x30uW6DICVNI2opwMoRLIc28VSzBiAWmIoAFq8N1X6bf4Qzxa0xoZloralCWHDsGo7jEBqhBJxLXy6X2xT5RYFVlsbP1D_OCsRoUAW6iC0I.";

//2020.gada paraugi
//const paraugiURL = "https://services1.arcgis.com/3dWrAGXGF8L1iW48/arcgis/rest/services/akd_mezuparb_paraugi2020jan_20jul/FeatureServer/0/query";
const paraugiURL = "https://services1.arcgis.com/3dWrAGXGF8L1iW48/arcgis/rest/services/mezuparb_paraugi2020/FeatureServer/0/query";

const paraugiOptions = {
  responseType: "json",
  query: {
    f: "json",
    where: "Parauga_nr <>'-'",
    returnGeometry: false,
    returnDistinctValues: true,
    outFields: "Kaitīgie_organismi"
    //returnCountOnly: true
  }
};

const kokiOptions = {
  responseType: "json",
  query: {
    f: "json",
    where: "1=1",
    returnGeometry: false,
    returnDistinctValues: true,
    outFields: "Koka_suga"
    //returnCountOnly: true
  }        
};
const krasuRinda = [[0, 0, 255], [0, 255, 0], [0, 255, 255], [255, 0, 0], [255, 0, 255], [255, 255, 0], [0, 0, 125], [0, 125, 0], [0, 125, 125], [125, 0, 0], [125, 0, 125], [125, 125, 0], [125, 125, 125], [125, 125, 255], [125, 255, 125], [125, 255, 255], [255, 125, 125], [255, 125, 255], [255, 255, 125], [255, 150, 0], [255, 0, 150], [150, 0, 255], [0, 150, 255], [0, 255, 150], [150, 255, 0], [255, 200, 200], [255, 255, 200], [255, 200, 255], [200, 255, 255], [200, 255, 200], [200, 200, 255], [200, 200, 200]];

const addParaugi = () => {
  document.getElementById("paraugi").addEventListener("click", () => {
    //atlasa visus, kur ir parauga numurs un atšķirīgi "KAitīgie organismi". Lai izveidotu kaitīgo organismu sarakstu
    Request(paraugiURL, paraugiOptions).then(function (response) {
      r3 = response;
      const organismi = [];
      const organismi1 = [];
      //numurētās paraugu listes izveidošana
      const organismiList = document.createElement("ol");
      document.getElementById("listDiv2").appendChild(organismiList);
      /* katru "kaitīgo organismu" ievieto sarakstā organismi. Tā kā uz vienu ģeometriju ir viss akts, kurā var būt vairāki paraugi, 
      veidojas kombinācijas, piemēram "Erwinia amylovora, Plum pox virus", "Bursaphelenchus", "Bursaphelenchus , Monochamus",
      kurus katru izdala kā atsevišķo KO. Te vajag tos sadalīt atsevišķos organismu nosaukumos un atkal no tiem atrast unikālos
      Iesākumam visus savieto kopīgā sarakstā
      */ 
      for (let i=0; i < response.data.features.length; i++) {
        organismi.push(response.data.features[i].attributes["Kaitīgie_organismi"]);
      }
      //tālāk ejam cauri jaunajam organismi sarakstam un par katru elementu
      for (let i=0; i < organismi.length; i++) {
          // if not null - gadās ar parauga numuru, bet bez KO
          if (organismi[i]) {
          //sadalīt pa semikoliem
          let separateNames = organismi[i].split("; ");
          
          //jaunos katru kā vienu atsevišķu samest listē organismi1
              for (const nosaukums of separateNames) {
                      organismi1.push(nosaukums);
              }
          } else {console.log("te vienam bija parauga numurs, bet nebija organisms")}
          
      }
      //izveidot jaunu listi organismi8, kur atfiltrēti nederīgie (tukšie un redzamie autoru vārdu fragmenti)
      const organismi8 = organismi1.filter(word => (word.length > 4) && (word !== "O'Donnell") && (word !== "Buhrer)"));
      //creating Set from array. Set contains unique values only
      const uniqueSet = new Set(organismi8);
      //back to array from Set
      organismi2 = [...uniqueSet];
      createSpeciesList(organismi2, organismiList, "checkboxes2");
      checkAllBoxes("checkAllparaugi", "checkboxes2");
      uncheckAllBoxes("uncheckAllparaugi", "checkboxes2");
      izveliesParaugu();
    });
  }, {once: true});
}

const addPunkti = () => {
  document.getElementById("koki").addEventListener("click", () => {
    //atlasa visus, kur ir atšķirīgi "Koka_suga". Lai izveidotu koku sugu sarakstu
    Request(paraugiURL, kokiOptions).then(function (response) {
      r5 = response;
      //numurētās paraugu listes izveidošana
      const kokiList = document.createElement("ol");
      kokiList.id = "kokuListe";
      document.getElementById("listDiv3").appendChild(kokiList);
      
    // no response.data.features, no katras feature paņem sugas nosaukumu un ievieto sugas2
    for (let i=0; i < response.data.features.length; i++) {
      if (response.data.features[i].attributes.Koka_suga) {
        koki2.push(response.data.features[i].attributes.Koka_suga);
      }
    }
    createSpeciesList(koki2, kokiList, "checkboxes3");
    checkAllBoxes("checkAllpunkti", "checkboxes3");
    uncheckAllBoxes("uncheckAllpunkti", "checkboxes3");
    izveliesKoku();

    });
  }, {once: true});
}

const chooseSpecies = () => {
  //lai ieķeksējot tiktu palaista tālāk grafikas uzzīmēšana uz kartes un aktu saraksta izveidošana un izķeksējot - grafiku no kartes noņem
  let checkboxes = document.getElementsByClassName("checkboxes");
    for (const el of checkboxes) {
        el.addEventListener("change", () => {
          if (el.checked) {
            // atrast grafikas, kuras ieķeksētajai sugai (el.value) jau ir uzzzīmētas
            let grlist = graphicsLayer.graphics.items.filter(e => e.attributes.Koku_sugas === el.value);
            // ja ir uzzīmētas - parādīt (visibility)
            if (grlist.length > 0) {  
              for (const gr of grlist) {
              gr.visible = true;
              }
            } else {
              //ja nav uzzīmētas - uzzīmēt piesaisītājā krāsā (el.colorcomb) (un izveidot aktu sarakstu)
              drawSpeciesGraphicCreateList(el.value, el.colorComb);
              }
          } else {
            //alert(`Noņem ${el.value}`);
            // remove species graphic
            removeSpeciesGraphic(el.value, "Koku_sugas", graphicsLayer);
            }
        });
    }
}

const izveliesParaugu = () => {
  let checkboxes2 = document.getElementsByClassName("checkboxes2");
  for (const el of checkboxes2) {
        el.addEventListener("change", () => {
          if (el.checked) {
            let grlist = graphicsLayer2.graphics.items.filter(e => e.attributes["Kaitīgie_organismi"] === el.value);

            if (grlist.length > 0) {  
              for (const gr of grlist) {
              gr.visible = true;
              }
            } else {
              drawParaugiCreateList(el.value, el.colorComb);
              }
          } else {
            //alert(`Noņem ${el.value}`);
            // remove species graphic
            removeSpeciesGraphic(el.value,"Kaitīgie_organismi", graphicsLayer2);
            }
        });
  }
}

const izveliesKoku = () => {
  let checkboxes3 = document.getElementsByClassName("checkboxes3");
  for (const el of checkboxes3) {
        el.addEventListener("change", () => {
          if (el.checked) {
            // atrast grafikas, kuras ieķeksētajai koku sugai (el.value) jau ir uzzzīmētas
            let grlist = graphicsLayer3.graphics.items.filter(e => e.attributes.Koka_suga === el.value);
            // ja ir uzzīmētas - parādīt (visibility)
            if (grlist.length > 0) {  
              for (const gr of grlist) {
              gr.visible = true;
              }
            } else {
              //ja nav uzzīmētas - uzzīmēt piesaisītājā krāsā (el.colorcomb) (un izveidot aktu sarakstu)
              drawKokiGraphicCreateList(el.value, el.colorComb);
              }
          } else {
            // remove species graphic
            removeSpeciesGraphic(el.value, "Koka_suga", graphicsLayer3);
            }
        });
    }
}

const drawParaugiCreateList = (organisms, colOR) => {
  const options2 = {
    responseType: "json",
    query: {
      f: "json",
      where: `Parauga_nr <>'-' AND Kaitīgie_organismi LIKE '%${organisms}%'`,
      //where: `Akta_nr='${organisms} '`,
      returnGeometry: true,
      outFields: "*",
      //returnCountOnly: true            
    }
  }

  let repList = [];
  let pointGraphicsArray2 = [];

  Request(paraugiURL, options2).then(function(response) {
    r4 = response;
    let results = response.data.features;

    //alert(results[0].geometry.rings[0][0][1]);
    
    for (const feature of results) {
      //šitos atlasītos jāsaglabā objektā
      let paraugData = {};
      paraugData.paraugaNr = feature.attributes.Akta_nr;
      paraugData.kaitOrg = feature.attributes.Kaitīgie_organismi;
      paraugData.kokSuga = feature.attributes.Koka_suga;

      let attributes1 = {Kaitīgie_organismi: organisms}     
      let point = {
        type: "point", // autocasts as new Point()
        x: feature.geometry.x,
        y: feature.geometry.y,
        spatialReference: {
          wkid: 3857
          }       
      }

      const gisPoint = webMercatorUtils.webMercatorToGeographic(point);
      paraugData.xCoord = gisPoint.x;
      paraugData.yCoord = gisPoint.y;
      attributes1.visiOrg = paraugData.kaitOrg;
      attributes1.paraugaNr = paraugData.paraugaNr;
      attributes1.kokSuga = paraugData.kokSuga;
      attributes1.xCoord = paraugData.xCoord;
      attributes1.yCoord = paraugData.yCoord;
      repList.push(paraugData);

      let markerSymbol = {
        type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
        color: colOR,
        outline: {
          // autocasts as new SimpleLineSymbol()
          color: [255, 255, 255],
          width: 2
        }
      };

      var pointGraphic = new Graphic({
        geometry: point,
        symbol: markerSymbol,
        attributes: attributes1,
        popupTemplate: {
          // autocasts as new PopupTemplate()
          title: "{paraugaNr}",
          content: [
            {
              type: "fields",
              fieldInfos: [
                {
                  fieldName: "xCoord"
                },
                {
                  fieldName: "yCoord"
                },
                {
                  fieldName: "visiOrg"
                },
                {
                  fieldName: "novads"
                }
              ]
            }
          ]
        }
      });

      //add graphics
      pointGraphicsArray2.push(pointGraphic);
    }
    return pointGraphicsArray2;
  }).then((returnedArray) => {
      let queryPromisesArray = returnedArray.map((gra) => {
        let novadiQuery = {
          geometry: gra.geometry,
          spatialRelationship: "intersects",
          outFields: "Nos_pilns",
          returnGeometry: false,
          where: "1=1"
        };
        return novaduSlanis.queryFeatures(novadiQuery); 
      });
      return queryPromisesArray;
  }).then((array) => {
    return Promise.all(array);
  }).then((resolvedArray) => {
    let novaduListe = resolvedArray.map((el) => {
        if (el.features.length > 0 && el.features[0].attributes.Nos_pilns) {
          return el.features[0].attributes.Nos_pilns;
        } else {
          return "novads neatradās";
        }
     });
      pointGraphicsArray2.forEach((gra, index) => {
      const nov = novaduListe[index];
      gra.attributes.novads = nov;
        //console.log(gra);
      });

      repList.forEach((item, index) => {
        const nov = novaduListe[index];
        item.novads = nov;
      });

      // izveido aktu sarakstu (saucas paraugu saraksts, bet tas ir aktu saraksts)
      parauguObjekts[organisms] = repList;
      let labelList = document.getElementsByTagName("label");
      for (const label of labelList) {
        if (label.textContent === organisms) {
          let parentNode = label.parentNode;
          let paraugiDiv = document.createElement("div");
          paraugiDiv.className = "paraugiNr";
          paraugiDiv.value = organisms;
          parentNode.appendChild(paraugiDiv);
          label.addEventListener("click", (e) => {
            for (const el of parauguObjekts[organisms]) {
              let p = document.createElement("p");
              p.textContent = `${el.xCoord}; ${el.yCoord}; ${el.paraugaNr}; ${el.kaitOrg}; ${el.kokSuga}; ${el.novads}`;
              paraugiDiv.appendChild(p);
            }
            e.target.addEventListener("click", () => {
              let divs = label.parentNode.getElementsByTagName("div");
              let div1 = divs[0];
              if (div1.style.display === "none") {
                div1.style.display = "block";
              } else {
                div1.style.display = "none";
                }
            });
          }, {once:true});
        } 
      }
      // add graphics to map
      pointGraphicsArray2.forEach((gr) => {
        graphicsLayer2.add(gr);
      });
    });

}

//2019.g akti
//const url = "https://services1.arcgis.com/3dWrAGXGF8L1iW48/arcgis/rest/services/akd_mezuparb_akti2019jan_dec/FeatureServer/0/query?token=X47D3D6fmd5mhtxPIbhrkQwlL1BE7wlBMt1yqhwJGq35Dva5www3CDjsfo8ldiq0XbGDW9GV4RU63pejaXIJ6jv_3XLTs3FUHqNwZrZ0DRLcbPDh6WtXHiBiXHpbJBOxQ9o0X_ovsbCiQyFvnd5dWnu-JcsfkIDuAKUno7IrZo4InfYzKhuvntFA_hd332LtKksafAK9jJdV37aV-UuKlMCQ6gcigDKv52VMYxobGsU.";
// 2020.gada akti līdz 20.jūlijam
//const url = "https://services1.arcgis.com/3dWrAGXGF8L1iW48/arcgis/rest/services/akd_mezuparb_akti2020jan_20jul/FeatureServer/0/query?token=X47D3D6fmd5mhtxPIbhrkQwlL1BE7wlBMt1yqhwJGq35Dva5www3CDjsfo8ldiq0XbGDW9GV4RU63pejaXIJ6jv_3XLTs3FUHqNwZrZ0DRLcbPDh6WtXHiBiXHpbJBOxQ9o0X_ovsbCiQyFvnd5dWnu-JcsfkIDuAKUno7IrZo4InfYzKhuvntFA_hd332LtKksafAK9jJdV37aV-UuKlMCQ6gcigDKv52VMYxobGsU."
//const url = "https://services1.arcgis.com/3dWrAGXGF8L1iW48/arcgis/rest/services/akd_mezuparb_akti2020jan_20jul/FeatureServer/0/query";
const url = "https://services1.arcgis.com/3dWrAGXGF8L1iW48/arcgis/rest/services/mezuparb_akti2020/FeatureServer/0/query";
const options  = {
  responseType: "json",
  query: {
    f: "json",
    where: "1=1",
    returnGeometry: false,
    returnDistinctValues: true,
    outFields: "Koku_sugas"
    //returnCountOnly: true
  }
};

const drawKokiGraphicCreateList = (koks, krasa) => {
  //uzzīmēt grafiku un uztaisīt aktu sarakstu
  // atlasīt tikai par šo koku sugu
  const options3 = {
    responseType: "json",
    query: {
      f: "json",
      where: `Koka_suga='${koks}'`,
      returnGeometry: true,
      outFields: "Koka_suga, Akta_nr, Parauga_nr, Kaitīgie_organismi",
      //returnCountOnly: true            
    }
  }

  let repList = [];
  let pointGraphicsArray3 = [];

  Request(paraugiURL, options3).then(function(response) {
    r6 = response;
    let results = response.data.features;

    //salasīt aktu numurus un citus atribūtus no rezultātiem un samest listē replist.
    for (const feature of results) {
      let koksData = {};
      koksData.Akta_nr = feature.attributes.Akta_nr;

      let attributes1 = feature.attributes;
     // Uzzīmēt punktu
      let point = {
        type: "point", // autocasts as new Point()
        x: feature.geometry.x,
        y: feature.geometry.y,
        spatialReference: {
          wkid: 3857
          }       
      }

      let gisPoint = webMercatorUtils.webMercatorToGeographic(point);
      attributes1.xCoord = gisPoint.x;
      attributes1.yCoord = gisPoint.y;
      koksData.xCoord = gisPoint.x;
      koksData.yCoord = gisPoint.y;
      repList.push(koksData);
      let markerSymbol = {
        type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
        color: krasa,
        outline: {
          // autocasts as new SimpleLineSymbol()
          color: [0, 125, 255],
          width: 2
        }
      };

      let pointGraphic = new Graphic({
        geometry: point,
        symbol: markerSymbol,
        attributes: attributes1,
        popupTemplate: {
          // autocasts as new PopupTemplate()
          title: "{Akta_nr}",
          content: [
            {
              type: "fields",
              fieldInfos: [
                {
                  fieldName: "xCoord"
                },
                {
                  fieldName: "yCoord"
                },
                {
                  fieldName: "novads"
                }
              ]
            }
          ]
        }
      });

      //push graphics into arrray
      pointGraphicsArray3.push(pointGraphic);
    }
    return pointGraphicsArray3;
  }).then((returnedArray) => {
    let queryPromisesArray = returnedArray.map((gra) => {
      let novadiQuery = {
        geometry: gra.geometry,
        spatialRelationship: "intersects",
        outFields: "Nos_pilns",
        returnGeometry: false,
        where: "1=1"
      };
      return novaduSlanis.queryFeatures(novadiQuery); 
    });
      return queryPromisesArray;
  }).then((array)=> {
   return Promise.all(array);
  }).then((resolvedArray)=> {
      let novaduListe = resolvedArray.map((el) => {
        if (el.features.length > 0 && el.features[0].attributes.Nos_pilns) {
          return el.features[0].attributes.Nos_pilns;
        } else {
          return "novads neatradās";
        }
     });
      //console.log(novaduListe);
      pointGraphicsArray3.forEach((gra, index) => {
      const nov = novaduListe[index];
      gra.attributes.novads = nov;
        //console.log(gra);
      });

      repList.forEach((item, index) => {
        const nov = novaduListe[index];
        item.novads = nov;
      });

        // izveido aktu (un visādu citu štruntu) sarakstu
      //pievieno kokuobjektam, piemēram kokuObjekts.Tilia = ["102-AKA-223-20", 094-AKA-213-20 utt]
      kokuObjekts[koks] = repList;
      const kokuListe = document.getElementById("kokuListe");
      let labelList = kokuListe.getElementsByTagName("label");
      // sameklē visas labels un ieķeksētajai atbilstošajā listItem (tajā, kur atrodas čekbokss un label) izveido jaunu div elementu
      for (const label of labelList) {
        if (label.textContent === koks) {
          let parentNode = label.parentNode;
          let aktiDiv = document.createElement("div");
          aktiDiv.className = "akti";
          parentNode.appendChild(aktiDiv);
          label.addEventListener("click", (e) => {
            for (const el of kokuObjekts[koks]) {
              //katram no aktu numuriem izveido savu p
              let p = document.createElement("p");
              p.textContent = `${el.xCoord}; ${el.yCoord}; ${el.Akta_nr}; ${el.novads}`;
              aktiDiv.appendChild(p);
            }
            e.target.addEventListener("click", () => {
              let divs = label.parentNode.getElementsByTagName("div");
              let div1 = divs[0];
              if (div1.style.display === "none") {
                div1.style.display = "block";
              } else {
                div1.style.display = "none";
                }
            });
          }, {once: true}); 
        }
      }
        //add graphics to map
      pointGraphicsArray3.forEach((gr) => {
        graphicsLayer3.add(gr);
      });
    });

}

const drawSpeciesGraphicCreateList = (species, colOR) => {
  //uzzīmēt grafiku un uztaisīt aktu sarakstu
  // atlasīt tikai par šo koku sugu
  const options2 = {
    responseType: "json",
    query: {
      f: "json",
      where: `Koku_sugas='${species}'`,
      returnGeometry: true,
      outFields: "Koku_sugas, Akta_nr, Kaitīgie_organismi",
      //returnCountOnly: true            
    }
  }
  let repList = [];
    let pointGraphicsArray1 = [];
    let polygonGraphicsArray1 = [];
  Request(url, options2).then(function(response) {
    r2 = response;
    let results = response.data.features;

    //alert(results[0].geometry.rings[0][0][1]);
    //salasīt aktu numurus (un tagad arī visu ko citu) no rezultātiem, kas ir šai sugai un samest listē replist.
    for (const feature of results) {
      let platibaData = {};
      platibaData.Akta_nr = feature.attributes.Akta_nr;

      // Uzzīmēt poligonu
      let polygon = {
        type: "polygon", // autocasts as new Polygon()
        rings: feature.geometry.rings,
        spatialReference: {
        wkid: 3857
        }       
      };

      let fillSymbol = {
      type: "simple-fill", // autocasts as new SimpleFillSymbol()
      color: [227, 139, 79, 0.8],
      outline: {
        // autocasts as new SimpleLineSymbol()
        color: [0, 255, 0],
        width: 6
      }
      };

      let attributes1 = feature.attributes;

      let polygonGraphic = new Graphic({
        geometry: polygon,
        symbol: fillSymbol,
        attributes: attributes1,
      });
      
      // uzzīmēt punktu uz poligona rings pirmā punkta
     let point = {
      type: "point", // autocasts as new Point()
      x: feature.geometry.rings[0][0][0], // 2713841.85385366
      y: feature.geometry.rings[0][0][1],
      spatialReference: {
        wkid: 3857
        }       
     // 7743457.16553558
      }

      const gisPoint = webMercatorUtils.webMercatorToGeographic(point);
      attributes1.xCoord = gisPoint.x;
      attributes1.yCoord = gisPoint.y;
      platibaData.xCoord = gisPoint.x;
      platibaData.yCoord = gisPoint.y;

      let markerSymbol = {
        type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
        color: colOR,
        outline: {
          // autocasts as new SimpleLineSymbol()
          color: [0, 0, 0],
          width: 1
        }
      };

      var pointGraphic = new Graphic({
        geometry: point,
        symbol: markerSymbol,
        attributes: attributes1,
        popupTemplate: {
          // autocasts as new PopupTemplate()
          title: "{Akta_nr}",
          content: [
            {
              type: "fields",
              fieldInfos: [
                {
                  fieldName: "xCoord"
                },
                {
                  fieldName: "yCoord"
                },
                {
                  fieldName: "Kaitīgie_organismi"
                },
                {
                  fieldName: "Koku_sugas"
                },
                {
                  fieldName: "novads"
                }
              ]
            }
          ]
        }
      });

      pointGraphicsArray1.push(pointGraphic);
      polygonGraphicsArray1.push(polygonGraphic);
      repList.push(platibaData);
    }

    return pointGraphicsArray1;
  }).then((returnedArray) => {

    let queryPromisesArray = returnedArray.map((gra) => {
      let novadiQuery = {
        geometry: gra.geometry,
        spatialRelationship: "intersects",
        outFields: "Nos_pilns",
        returnGeometry: false,
        where: "1=1"
      };
      return novaduSlanis.queryFeatures(novadiQuery); 
    });
      return queryPromisesArray;
  }).then((array)=> {
    // queryfeatures ir promise
   return Promise.all(array);
  }).then((resolvedArray) => {
     let novaduListe = resolvedArray.map((el) => {
      if (el.features.length > 0 && el.features[0].attributes.Nos_pilns) {
        return el.features[0].attributes.Nos_pilns;
      } else {
        return "novads neatradās";
      }
     });
      //console.log(novaduListe);
      pointGraphicsArray1.forEach((gra, index) => {
        const nov = novaduListe[index];
        gra.attributes.novads = nov;
        //console.log(gra);
      });

      repList.forEach((item, index) => {
        const nov = novaduListe[index];
        item.novads = nov;
      });
     //console.log(repList);
      // izveido aktu sarakstu
      //pievieno aktuobjektam, piemēram aktuObjekts."Erwinia amylovora" = ["102-AKA-223-20", 094-AKA-213-20 utt]
      aktuObjekts[species] = repList;
      let listDiv = document.querySelector("#listDiv");
      let labelList = listDiv.getElementsByTagName("label");
      // sameklē visas labels un ieķeksētajai atbilstošajā listItem (tajā, kur atrodas čekbokss un label) izveido jaunu div elementu
      for (const label of labelList) {
        if (label.textContent === species) {
          let parentNode = label.parentNode;
          let aktiDiv = document.createElement("div");
          aktiDiv.className = "akti";
          parentNode.appendChild(aktiDiv);
          label.addEventListener("click", (e) => {
            for (const el of aktuObjekts[species]) {
              //katram no aktu numuriem izveido savu p
              let p = document.createElement("p");
                p.textContent = `${el.xCoord}; ${el.yCoord}; ${el.novads}; ${el.Akta_nr}`;
              aktiDiv.appendChild(p);
            }
            e.target.addEventListener("click", () => {
              let divs = label.parentNode.getElementsByTagName("div");
              let div1 = divs[0];
              if (div1.style.display === "none") {
                div1.style.display = "block";
              } else {
                div1.style.display = "none";
                }
            });
          }, {once:true});
        }
      }
      //add graphics to map
      pointGraphicsArray1.forEach((gr) => {
        graphicsLayer.add(gr);
      });
      polygonGraphicsArray1.forEach((gr) => {
        graphicsLayer.add(gr);
      });
     
    });



} 

const removeSpeciesGraphic = (species, field, layer) => {
  let grlist = layer.graphics.items.filter(e => e.attributes[field] === species); 
    for (const gr of grlist) {
      gr.visible = false;
    }
}

const checkAllBoxes = (buttonName, checkboxClassName) => {
  document.getElementById(buttonName).addEventListener("click", () => {
    let boxes = document.getElementsByClassName(checkboxClassName);
    for (const box of boxes) {
      box.checked = true;
      const e = new Event("change");
      box.dispatchEvent(e); 
    }
  });

}

const uncheckAllBoxes = (buttonName, checkboxClassName) => {
  document.getElementById(buttonName).addEventListener("click", () => {
    let boxes = document.getElementsByClassName(checkboxClassName);
    for (const box of boxes) {
        box.checked = false;
        const e = new Event("change");
        box.dispatchEvent(e); 
    }
  });
}

const createSpeciesList = (array, domElement, klasesnosaukums) => {
  //izveido sarakstu ar čekboksiem no piedāvātā saraksta (parametrā array). DomElement ir, kur sarakstu ievietot. Klasesnosaukums ir jāliek pēdiņās, tādu classname piešķirs izveidotajiem čekboksiem    
  for (let j = 0; j < array.length; j++) {            
    let listItem = document.createElement("li");
    domElement.appendChild(listItem);
    //izveidot čekboksu element input, type checkbox, tas, kas ir blakus teksts, tas ir label
    let chk = document.createElement("input");
      chk.type = "checkbox";
      chk.value = array[j];
  //colorComb - krāsa, lai katru bumbuli zīmētu citā krāsā
      if(j >= krasuRinda.length) {
        chk.colorComb = krasuRinda[krasuRinda.length + j];
      } else {
        chk.colorComb = krasuRinda[j];
      }
      
      chk.className = klasesnosaukums;
      listItem.appendChild(chk);
      let lbl = document.createElement("label");
      lbl.textContent = array[j];
      listItem.appendChild(lbl);
      }
}

const createShortList = () => {
  // izveidot īso sugu sarakstu, tādu, kur ir tikai pa vienai sugai. To atlasa no sugas2, sadalot katru elementu vārdos pa semikoliem, un uz sugas3 aizsūta tikai tos, kur ir viens vārds
  document.getElementById("toShortList").addEventListener("click", () => {
    document.getElementById("listDiv").innerHTML = "";
    document.getElementById("virsraksts").textContent = "Atpakaļ uz garo sarakstu var tikt ar refresh";
    graphicsLayer.removeAll();
    const sugas3 = [];
    const speciesList = document.createElement("ol");
    document.getElementById("listDiv").appendChild(speciesList);
    for (const suga of sugas2) {
      const splittedName = suga.split("; ");
      //console.log(splittedName);
      if (splittedName.length === 1) {
        sugas3.push(suga);
      }
    }
    //console.log(sugas3);
    createSpeciesList(sugas3, speciesList, "checkboxes");
    checkAllBoxes("checkAll", "checkboxes");
    uncheckAllBoxes("uncheckAll", "checkboxes");
    chooseSpecies();
  }, {once:true});
}
  


Request(url, options).then(function(response) {
    r = response;
    //izveido numurētā sugu saraksta elementu un ievieto tam paredzētajā dokumenta vietā
    const speciesList = document.createElement("ol");
    document.getElementById("listDiv").appendChild(speciesList);
    // no response.data.features, no katras feature paņem sugas nosaukumu un ievieto sugas2
    for (let i=0; i < r.data.features.length; i++) {
      sugas2.push(r.data.features[i].attributes.Koku_sugas);
    }
    createSpeciesList(sugas2, speciesList, "checkboxes");
    checkAllBoxes("checkAll", "checkboxes");
    uncheckAllBoxes("uncheckAll", "checkboxes");
    createShortList();
    chooseSpecies();
    addParaugi();
    addPunkti();
    });
});