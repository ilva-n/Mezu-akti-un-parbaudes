"use strict"
let aktuObjekts;
let parauguObjekts;
let kokuObjekts;
let r;
let r2;

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

  const parauguSlanis = new FeatureLayer({
    url: "https://services1.arcgis.com/3dWrAGXGF8L1iW48/arcgis/rest/services/akd_mezuparb_paraugi2020/FeatureServer/0"
  }); 


  const graphicsLayer = new GraphicsLayer();
  const graphicsLayer2 = new GraphicsLayer();
  const graphicsLayer3 = new GraphicsLayer();
    map.add(graphicsLayer);
    map.add(graphicsLayer2);
    map.add(graphicsLayer3);

  const aktiURL = "https://services1.arcgis.com/3dWrAGXGF8L1iW48/arcgis/rest/services/akd_mezuparb_akti1/FeatureServer/0/query";
  
  const aktioptions  = {
    responseType: "json",
    query: {
      f: "json",
      where: "1=1",
      returnGeometry: false,
      returnDistinctValues: true,
      outFields: "Koku_sugas"
    }
  };
  const paraugiURL = "https://services1.arcgis.com/3dWrAGXGF8L1iW48/arcgis/rest/services/akd_mezuparb_paraugi2020/FeatureServer/0/query";
  const paraugiOptions = {
    responseType: "json",
    query: {
      f: "json",
      where: "Parauga_nr <>'-'",
      returnGeometry: false,
      returnDistinctValues: true,
      outFields: "Kaitīgie_organismi"
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
    }        
  };

  const krasuRinda = [[0, 0, 255], [0, 255, 0], [0, 255, 255], [255, 0, 0], [255, 0, 255], [255, 255, 0], [0, 0, 125], [0, 125, 0], [0, 125, 125], [125, 0, 0], [125, 0, 125], [125, 125, 0], [125, 125, 125], [125, 125, 255], [125, 255, 125], [125, 255, 255], [255, 125, 125], [255, 125, 255], [255, 255, 125], [255, 150, 0], [255, 0, 150], [150, 0, 255], [0, 150, 255], [0, 255, 150], [150, 255, 0], [255, 200, 200], [255, 255, 200], [255, 200, 255], [200, 255, 255], [200, 255, 200], [200, 200, 255], [200, 200, 200]];

  const aktuDalasSpecialasLietas = {
    checkboxClassName: "checkboxes",
    checkAllbuttonName: "checkAll",
    uncheckAllbuttonName: "uncheckAll",
    listButtonName: "toShortList",
    grafikuslanis: graphicsLayer,
    oneItemQueryOptions: {
        responseType: "json",
        query: {
          f: "json",
        //šo jāpieliek vēlāk jo species nav zināms where: `Koku_sugas='${species}'`,
          returnGeometry: true,
          outFields: "*",         
        }
    },
    listesVieta: "listDiv",
    searchField: "Koku_sugas",
    tips: "akti"
  };

  const parauguDalasSpecialasLietas = {
    checkboxClassName: "checkboxes2",
    checkAllbuttonName: "checkAllparaugi",
    uncheckAllbuttonName: "uncheckAllparaugi",
    listButtonName: "paraugi",
    grafikuslanis: graphicsLayer2,
    oneItemQueryOptions: {
      responseType: "json",
      query: {
        f: "json",
        //šo jāpieliek vēlāk jo organisms nav zināms where: `Parauga_nr <>'-' AND Kaitīgie_organismi LIKE '%${species}%'`,
        returnGeometry: true,
        outFields: "*",          
      }
    },
    listesVieta: "listDiv2",
    searchField: "Kaitīgie_organismi",
    tips: "paraugi"
  };

  const kokuDalasSpecialasLietas = {
    checkboxClassName: "checkboxes3",
    checkAllbuttonName: "checkAllpunkti",
    uncheckAllbuttonName: "uncheckAllpunkti",
    listButtonName: "koki",
    grafikuslanis: graphicsLayer3,
    oneItemQueryOptions: {
      responseType: "json",
      query: {
        f: "json",
        // šo jāpieliek vēlāk jo koks nav zināms where: `Koka_suga='${species}'`,
        returnGeometry: true,
        outFields: "*",         
      }
    },
    listesVieta: "listDiv3",
    searchField: "Koka_suga",
    tips: "koki"
  };

  // constructor
  const NewOne = function (obj) {
    this.checkboxClassName = obj.checkboxClassName;
    this.checkAllbuttonName = obj.checkAllbuttonName;
    this.uncheckAllbuttonName = obj.uncheckAllbuttonName;
    this.listButtonName = obj.listButtonName;
    this.grafikuslanis = obj.grafikuslanis;
    this.oneItemQueryOptions = obj.oneItemQueryOptions;
    this.listesVieta = obj.listesVieta;
    this.searchField = obj.searchField;
    this.tips = obj.tips;
  };

  NewOne.prototype.createSpeciesList = function(array, domElement) {
    //izveido sarakstu ar čekboksiem no piedāvātā saraksta (parametrā array). DomElement ir, kur sarakstu ievietot.  
    for (let j = 0; j < array.length; j++) {       
      let listItem = document.createElement("li");
      domElement.appendChild(listItem);
      //izveidot čekboksu: element-input, type-checkbox. Tas, kas ir blakus teksts, tas ir label
      let chk = document.createElement("input");
        chk.type = "checkbox";
        chk.value = array[j];
      //colorComb - krāsa, lai katrai sugai bumbuļus zīmētu citā krāsā
      let g = j % krasuRinda.length;
        chk.colorComb = krasuRinda[g];
        chk.className = this.checkboxClassName;
        listItem.appendChild(chk);
        let lbl = document.createElement("label");
        lbl.textContent = array[j];
        listItem.appendChild(lbl);
    }
  };

  NewOne.prototype.checkAllBoxes = function() {
    document.getElementById(this.checkAllbuttonName).addEventListener("click", () => {
      let boxes = document.getElementsByClassName(this.checkboxClassName);
      for (const box of boxes) {
        box.checked = true;
        const e = new Event("change");
        box.dispatchEvent(e); 
      }
    });
  };

  NewOne.prototype.uncheckAllBoxes = function() {
    document.getElementById(this.uncheckAllbuttonName).addEventListener("click", () => {
      let boxes = document.getElementsByClassName(this.checkboxClassName);
      for (const box of boxes) {
          box.checked = false;
          const e = new Event("change");
          box.dispatchEvent(e); 
      }
    });
  }

  NewOne.prototype.removeSpeciesGraphic = function(species) {
    let grlist = this.grafikuslanis.graphics.items.filter(e => e.attributes[this.searchField] === species); 
    for (const gr of grlist) {
      gr.visible = false;
    }
  };
  NewOne.prototype.dabutSuguSarakstu = function() {
    //funnkcija aizpildīs list this.speciesList
    this.speciesList = [];
    Request(this.url, this.options).then((response) => {
      r = response;
      if (this.tips === "paraugi") {
        const organismi = [];
        const organismi1 = [];
        for (let i=0; i < response.data.features.length; i++) {
          // if not null - gadās ar parauga numuru, bet bez KO
          if (response.data.features[i].attributes["Kaitīgie_organismi"]) {
            organismi.push(response.data.features[i].attributes["Kaitīgie_organismi"]);
          }
        }
          //tālāk ejam cauri jaunajam organismi sarakstam un par katru elementu
        for (let i=0; i < organismi.length; i++) {
            //sadalīt pa semikoliem
          let separateNames = organismi[i].split("; ");
            //jaunos katru kā vienu atsevišķu samest listē organismi1
            for (const nosaukums of separateNames) {
              organismi1.push(nosaukums);
            }      
        }
          //izveidot jaunu listi organismi8, kur atfiltrēti nederīgie (tukšie un redzamie autoru vārdu fragmenti)
          const organismi8 = organismi1.filter(word => (word.length > 4) && (word !== "O'Donnell") && (word !== "Buhrer)"));
          //creating Set from array. Set contains unique values only
          const uniqueSet = new Set(organismi8);
          //back to array from Set
          this.speciesList = [...uniqueSet];
          this.speciesList.sort();
      } else {
        for (let i=0; i < response.data.features.length; i++) {
          if (response.data.features[i].attributes[this.searchField]) {
            this.speciesList.push(response.data.features[i].attributes[this.searchField]);
            this.speciesList.sort();       
          }
        }
      }
      const specList = document.createElement("ol");
      document.getElementById(this.listesVieta).appendChild(specList);
      this.createSpeciesList(this.speciesList, specList);
      this.checkAllBoxes();
      this.uncheckAllBoxes();
      this.chooseSpecies();
    });
  };

  NewOne.prototype.addToButton = function() {
    document.getElementById(this.listButtonName).addEventListener("click", () => {
      if(this.listButtonName === "toShortList") {
        document.getElementById("listDiv").innerHTML = "";
        document.getElementById("virsraksts").textContent = "Atpakaļ uz garo sarakstu var tikt ar refresh";
        this.grafikuslanis.removeAll();
        const sugas3 = [];
        for (const suga of this.speciesList) {
          const splittedName = suga.split("; ");
          //console.log(splittedName);
          if (splittedName.length === 1) {
            sugas3.push(suga);
          }
        }
        this.speciesList = sugas3;
        this.speciesList.sort();
        const specList = document.createElement("ol");
        document.getElementById(this.listesVieta).appendChild(specList);
        this.createSpeciesList(this.speciesList, specList);
        this.checkAllBoxes();
        this.uncheckAllBoxes();
        this.chooseSpecies();
      } else {
        document.getElementById("labojumi").style.display = "block";
        this.dabutSuguSarakstu();
      }
    }, {once: true});
  };

  NewOne.prototype.drawGraphicCreateList = function(species, colOR) {
    //uzzīmēt grafiku un uztaisīt aktu sarakstu
    // atlasīt tikai par šo sugu
    const options2 = this.oneItemQueryOptions;
    if (this.tips === "akti") {
      options2.query.where = `Koku_sugas='${species}'`;
    } else if (this.tips === "paraugi") {
      options2.query.where = `Parauga_nr <>'-' AND Kaitīgie_organismi LIKE '%${species}%'`
    } else if (this.tips === "koki") {
      options2.query.where = `Koka_suga='${species}'`
    }

    let repList = [];
    let pointGraphicsArray1 = [];
    let polygonGraphicsArray1 = [];
    Request(this.url, options2).then((response) => {
      r2 = response;
      let results = response.data.features;
      //alert(results[0].geometry.rings[0][0][1]);
      //salasīt aktu numurus (un tagad arī visu ko citu) no rezultātiem, kas ir šai sugai un samest listē replist.
      for (const feature of results) {
        let itemData = {};
        let attributes1;
        itemData.id = feature.attributes.ObjectId;
        if (this.tips === "paraugi") {
          itemData.Akta_nr = feature.attributes.Akta_nr
          itemData.kaitOrg = feature.attributes.Kaitīgie_organismi;
          itemData.kokSuga = feature.attributes.Koka_suga;
          attributes1 = {Kaitīgie_organismi: species};
          attributes1.visiOrg = itemData.kaitOrg;
          attributes1.Akta_nr = itemData.Akta_nr;
          attributes1.kokSuga = itemData.kokSuga;
          attributes1.id = itemData.id;
          attributes1.paraugaNr = feature.attributes.Parauga_nr;
        } else {
          itemData.Akta_nr = feature.attributes.Akta_nr;
          attributes1 = feature.attributes;
          attributes1.id = itemData.id;
        }
        if (this.tips === "akti") {
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
    
          let polygonGraphic = new Graphic({
            geometry: polygon,
            symbol: fillSymbol,
            attributes: attributes1
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
          itemData.xCoord = gisPoint.x;
          itemData.yCoord = gisPoint.y;
    
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
                    },
                    {
                      fieldName: "id"
                    }
                  ]
                }
              ]
            }
          });
    
          pointGraphicsArray1.push(pointGraphic);
          polygonGraphicsArray1.push(polygonGraphic);

        } else if (this.tips === "paraugi") {
          let point = {
            type: "point", // autocasts as new Point()
            x: feature.geometry.x,
            y: feature.geometry.y,
            spatialReference: {
              wkid: 3857
              }       
          }

          const gisPoint = webMercatorUtils.webMercatorToGeographic(point);
          itemData.xCoord = gisPoint.x;
          itemData.yCoord = gisPoint.y;
          attributes1.xCoord = itemData.xCoord;
          attributes1.yCoord = itemData.yCoord;

          let markerSymbol = {
            type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
            color: colOR,
            outline: {
              // autocasts as new SimpleLineSymbol()
              color: [255, 0, 0],
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
                      fieldName: "kokSuga"
                    },
                    {
                      fieldName: "novads"
                    },
                    {
                      fieldName: "id"
                    }
                  ]
                }
              ]
            }
          });
          pointGraphicsArray1.push(pointGraphic);
        } else if (this.tips === "koki") {
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
          itemData.xCoord = gisPoint.x;
          itemData.yCoord = gisPoint.y;

          let markerSymbol = {
            type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
            color: colOR,
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
                    },
                    {
                      fieldName: "id"
                    }
                  ]
                }
              ]
            }
          });
    
          //push graphics into arrray
          pointGraphicsArray1.push(pointGraphic);
        }
        repList.push(itemData);
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

        pointGraphicsArray1.forEach((gra, index) => {
          const nov = novaduListe[index];
          gra.attributes.novads = nov;
        });

        repList.forEach((item, index) => {
          const nov = novaduListe[index];
          item.novads = nov;
        });
        // izveido aktu sarakstu
        //pievieno objektam, piemēram aktuObjekts."Erwinia amylovora" = ["102-AKA-223-20", 094-AKA-213-20 utt]
        this[species] = repList;
        let listDiv = document.getElementById(this.listesVieta);
        let labelList = listDiv.getElementsByTagName("label");
        // sameklē visas labels un ieķeksētajai atbilstošajā listItem (tajā, kur atrodas čekbokss un label) izveido jaunu div elementu
        for (const label of labelList) {
          if (label.textContent === species) {
            let parentNode = label.parentNode;
            let aktiDiv = document.createElement("div");

            aktiDiv.className = "akti";
            parentNode.appendChild(aktiDiv);
            label.addEventListener("click", (e) => {
              for (const el of this[species]) {
                //katram no aktu numuriem izveido savu p
                let p = document.createElement("p");
                            // no šejienes jāsāk skatīties
                  p.textContent = `${el.xCoord}; ${el.yCoord}; ${el.novads}; ${el.Akta_nr}; ${el.id}`;
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
          this.grafikuslanis.add(gr);
        });
        if (polygonGraphicsArray1 && polygonGraphicsArray1.length > 0) {
          polygonGraphicsArray1.forEach((gr) => {
            this.grafikuslanis.add(gr);
          });
        }
      });
  };

  NewOne.prototype.chooseSpecies = function() {
    //lai ieķeksējot tiktu palaista tālāk grafikas uzzīmēšana uz kartes un aktu saraksta izveidošana un izķeksējot - grafiku no kartes noņem
    let checkboxes = document.getElementsByClassName(this.checkboxClassName);
      for (const el of checkboxes) {
          el.addEventListener("change", () => {
            if (el.checked) {
              // atrast grafikas, kuras ieķeksētajai sugai (el.value) jau ir uzzzīmētas
              let grlist = this.grafikuslanis.graphics.items.filter(e => e.attributes[this.searchField] === el.value);
              // ja ir uzzīmētas - parādīt (visibility)
              if (grlist.length > 0) {  
                for (const gr of grlist) {
                gr.visible = true;
                }
              } else {
                //ja nav uzzīmētas - uzzīmēt piesaisītājā krāsā (el.colorcomb) (un izveidot aktu sarakstu)
                this.drawGraphicCreateList(el.value, el.colorComb);
                }
            } else {
              // remove species graphic
              this.removeSpeciesGraphic(el.value);
              }
          });
      }
  }

  aktuObjekts = new NewOne(aktuDalasSpecialasLietas);
  parauguObjekts = new NewOne(parauguDalasSpecialasLietas);
  kokuObjekts = new NewOne(kokuDalasSpecialasLietas);
  aktuObjekts.url = aktiURL;
  parauguObjekts.url = paraugiURL;
  kokuObjekts.url = paraugiURL;
  aktuObjekts.options = aktioptions;
  parauguObjekts.options = paraugiOptions;
  kokuObjekts.options = kokiOptions;
  aktuObjekts.dabutSuguSarakstu();
  aktuObjekts.addToButton();
  parauguObjekts.addToButton();
  kokuObjekts.addToButton();


  //Tālāk viss labošanai  
  //notīrīt ailes
  const notiritAiles = function() {
    document.getElementById("atkalIdVieta").innerHTML = "";
    document.getElementById("aktaAile").value = "";
    document.getElementById("paraugaAile").value = "";
    document.getElementById("kokaAile").value = "";
    document.getElementById("OrgAile").value = "";
    document.getElementById("DatumAile").value = "";
    document.getElementById("labosanasIdLauks").value = "";
    document.getElementById("x_aile").value = "";
    document.getElementById("y_aile").value = "";
    let augsa = document.getElementById("labojumuAugsa");
      augsa.style = "display:block";
    let laucins3 = document.getElementById("tresaisLAucins");
      laucins3.style = "display:none";
  }

  //nolasīt ailes
  const createNewFeatureObj = function() {
    const obj = {};
    obj.xkoord = document.getElementById("x_aile").value;
    obj.ykoord = document.getElementById("y_aile").value;
    //const datumTeksts = document.getElementById("DatumAile").value;
    //const datumDalas = datumTeksts.split('.');
    obj.attributes2 = {};
    obj.attributes2.Akta_nr = document.getElementById("aktaAile").value;
    obj.attributes2.Parauga_nr = document.getElementById("paraugaAile").value;
    obj.attributes2.Koka_suga = document.getElementById("kokaAile").value;
    obj.attributes2.Kaitīgie_organismi = document.getElementById("OrgAile").value;
    obj.attributes2.Parbaudes_datums = document.getElementById("DatumAile").value;
    //obj.attributes2.Parbaudes_datums = new Date(datumDalas[2], datumDalas[1] - 1, datumDalas[0]);
    return obj;
  }

  // izveidot jaunu Feature (new Graphic)
  const createNewFeature1 = function(obj){
    const point = {
        type: "point",
        x: obj.xkoord,
        y: obj.ykoord,
        spatialReference: { wkid:4326 }
      };
    const attributes2 = obj.attributes2;
    const jaunsPunkts = new Graphic({
        geometry: point,
        attributes: attributes2
      });
    return jaunsPunkts;
  };

  // labošanas forma
  const atvertLabosanasFormu = function(res) {
    const laucins3 = document.getElementById("tresaisLAucins");
      laucins3.style = "display:block";
    document.getElementById("atrastaisPunkts").style = "display:none";
    document.getElementById("atrastaisPunkts").innerHTML = "";
    const respPoint = res.data.features[0].geometry;
    const gisPoint = webMercatorUtils.webMercatorToGeographic(respPoint);
    const idVieta = document.getElementById("atkalIdVieta");
      idVieta.textContent = `Id: ${res.data.features[0].attributes.ObjectId}`;
    const xVieta = document.getElementById("x_aile");
      xVieta.value = gisPoint.x;
    const yVieta = document.getElementById("y_aile");
      yVieta.value = gisPoint.y;
    const aktaAile = document.getElementById("aktaAile");
      aktaAile.value = res.data.features[0].attributes.Akta_nr;
    const paraugaAile = document.getElementById("paraugaAile");
      paraugaAile.value = res.data.features[0].attributes.Parauga_nr;
    const kokaAile = document.getElementById("kokaAile");
      kokaAile.value = res.data.features[0].attributes.Koka_suga;
    const orgAile = document.getElementById("OrgAile");
      orgAile.value = res.data.features[0].attributes.Kaitīgie_organismi;
    const datumAile = document.getElementById("DatumAile");
      datumAile.value = res.data.features[0].attributes.Parbaudes_datums;
    const apstPoga1 = document.createElement("button");
      apstPoga1.innerHTML = "Apstiprināt";
    const atceltPoga1 = document.createElement("button");
      atceltPoga1.innerHTML = "Atcelt";
    atceltPoga1.addEventListener("click", () => {
        notiritAiles();
        atceltPoga1.remove();
        apstPoga1.remove();
    });
    apstPoga1.addEventListener("click", ()=> {
      const noAilemNolasitais = createNewFeatureObj();
      const punkts = createNewFeature1(noAilemNolasitais);
      punkts.attributes.ObjectId = res.data.features[0].attributes.ObjectId;
      //console.log(punkts);
      const edits = {
        updateFeatures: [punkts]
      };
      parauguSlanis.applyEdits(edits).then((edresult) => {
        //console.log(edresult);
        atceltPoga1.innerHTML = "Atpakaļ";
        apstPoga1.remove();
        const pazinojums = document.createElement("p");
        if (edresult.updateFeatureResults[0].error) {
          pazinojums.textContent = `Labošana neizdevās: ${edresult.updateFeatureResults[0].error.name}: ${edresult.updateFeatureResults[0].error.message}`;
        } else {
        pazinojums.textContent = `Labots elements ar id ${edresult.updateFeatureResults[0].objectId}`;
        }
        laucins3.appendChild(pazinojums);
        atceltPoga1.addEventListener("click", () => {
          notiritAiles();
          atceltPoga1.remove();
          pazinojums.remove();
        });
      });
    }, {once: true});
    laucins3.appendChild(apstPoga1);
    laucins3.appendChild(atceltPoga1);
  }

  // dzēst elementu
  const deleteteFeature1 = function(res,laucins) {
    const id = res.data.features[0].attributes.ObjectId;
    const edits = {
      deleteFeatures: [{objectId: id}]
    };
    parauguSlanis.applyEdits(edits).then((edresult) => {
      //console.log(edresult);
      const pazinojums = document.createElement("p");
      if (edresult.deleteFeatureResults[0].error) {
        pazinojums.textContent = `Dzēšana neizdevās: ${edresult.deleteFeatureResults[0].error.name}: ${edresult.deleteFeatureResults[0].error.message}`;
      } else {
      pazinojums.textContent = `Dzēsts elements ar id ${edresult.deleteFeatureResults[0].objectId}`;
      }
      laucins.appendChild(pazinojums);
    });

  };

 //pievienot jaunu punktu
 document.getElementById("jaunsPoga").addEventListener("click", () => {
  const laucins3 = document.getElementById("tresaisLAucins");
    laucins3.style = "display:block";
  document.getElementById("labojumuAugsa").style="display:none";
  const apstPoga1 = document.createElement("button");
  apstPoga1.innerHTML = "Apstiprināt";
  const atceltPoga1 = document.createElement("button");
  atceltPoga1.innerHTML = "Atcelt";
  laucins3.appendChild(apstPoga1);
  laucins3.appendChild(atceltPoga1);
  atceltPoga1.addEventListener("click", ()=> {
    laucins3.style = "display:none";
        let augsa = document.getElementById("labojumuAugsa");
        augsa.style = "display:block";
        atceltPoga1.remove();
        apstPoga1.remove();
  });
  apstPoga1.addEventListener("click", () => {
    const noAilemNolasitais = createNewFeatureObj();
    const jaunsPunkts = createNewFeature1(noAilemNolasitais);
    const edits = {
      addFeatures: [jaunsPunkts]
    };
    parauguSlanis.applyEdits(edits).then((edresult) => {
      //console.log(edresult);
      atceltPoga1.innerHTML = "Atpakaļ";
      apstPoga1.remove();
      const pazinojums = document.createElement("p");
      if (edresult.addFeatureResults[0].error) {
        pazinojums.textContent = `Pievienošana neizdevās: ${edresult.addFeatureResults[0].error.name}: ${edresult.addFeatureResults[0].error.message}`;
      } else {
      pazinojums.textContent = `Pievienots jauns elements ar id ${edresult.addFeatureResults[0].objectId}`;
      }
      laucins3.appendChild(pazinojums);
      atceltPoga1.addEventListener("click", () => {
        notiritAiles();
        atceltPoga1.remove();
        pazinojums.remove();
      });
    });  
  }, {once: true});

 });

 //atrast esošu punktu 
  document.getElementById("atrastPoga").addEventListener("click", () => {
    let idLaucins = document.getElementById("labosanasIdLauks");
    let idNum = idLaucins.value;
    const optionsLabosanai = {
      responseType: "json",
      query: {
        f: "json",
        where: `ObjectId='${idNum}'`,
        returnGeometry: true,
        outFields: "*"
      }
    }
    Request(paraugiURL, optionsLabosanai).then((response) => {
      let augsha = document.getElementById("labojumuAugsa");
      let otrsLaucins = document.getElementById("atrastaisPunkts");
      let p = document.createElement("p");
      let atceltPoga = document.createElement("button");
      atceltPoga.addEventListener("click", () =>{
        otrsLaucins.innerHTML = "";
        otrsLaucins.style = "display:none";
        document.getElementById("labosanasIdLauks").value = "";
        augsha.style = "display:block";
      });
      if (response.data.features.length > 0) {
        const respPoint = response.data.features[0].geometry;
        const gisPoint = webMercatorUtils.webMercatorToGeographic(respPoint);
        p.innerHTML = `Id: ${response.data.features[0].attributes.ObjectId} <br> Akta_nr: ${response.data.features[0].attributes.Akta_nr} <br>
        Parauga nr: ${response.data.features[0].attributes.Parauga_nr} <br> Koka suga: ${response.data.features[0].attributes.Koka_suga} <br>
        Kaitīgie organismi: ${response.data.features[0].attributes.Kaitīgie_organismi} <br> Pārbaudes datums: ${response.data.features[0].attributes.Parbaudes_datums} <br>
        x_(lon): ${gisPoint.x}  <br> y_(lat): ${gisPoint.y}`
        let labotPoga = document.createElement("button");
        labotPoga.innerHTML = "Labot";
        let dzestPoga = document.createElement("button");
        dzestPoga.innerHTML = "Dzēst";
        atceltPoga.innerHTML = "Atcelt";
        dzestPoga.addEventListener("click", () => {
          deleteteFeature1(response, otrsLaucins);
          atceltPoga.innerHTML = "Atpakaļ";
          labotPoga.remove();
          dzestPoga.remove();
        });
        otrsLaucins.appendChild(p);
        otrsLaucins.appendChild(labotPoga);
        otrsLaucins.appendChild(dzestPoga);
        otrsLaucins.appendChild(atceltPoga);
        otrsLaucins.style = "display:block";
        augsha.style = "display:none";
        labotPoga.addEventListener("click", () => {
          atvertLabosanasFormu(response);
        });
      } else {
        p.textContent = "tāds elements ir nodzēsts vai nekad nav bijis";
        otrsLaucins.appendChild(p);
        otrsLaucins.style = "display:block";
        augsha.style = "display:none";
        atceltPoga.innerHTML = "Atpakaļ";
        otrsLaucins.appendChild(atceltPoga);
      } 
    });
  });
});