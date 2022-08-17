"use strict"
let aktuObjekts;
let parauguObjekts;
let kokuObjekts;
let r;
let r2;
let rawPointObj;
let rawPolyObj
const visiKoki = {};
const visiAkti = {};
const visiParaugi = {};

require([
  "esri/Map",
  "esri/views/MapView",
  "esri/request",
  "esri/layers/GraphicsLayer",
  "esri/Graphic", 
  "esri/geometry/support/webMercatorUtils",
  "esri/layers/FeatureLayer",
  "esri/smartMapping/symbology/support/colorRamps",
  "esri/Color",
  "esri/core/reactiveUtils"
], function(Map, MapView, Request, GraphicsLayer, Graphic, webMercatorUtils, FeatureLayer, colorRamps, Color, reactiveUtils) {
  let punktiLayerView, aktiLayerView;
  const selectedKokItems = [];
  const selectedOrgItems = [];
  const selectedAktItems = [];
  const paraugValueInfos = [];

  const aktRenderer1 = {
    type: "simple",  // autocasts as new SimpleRenderer()
    symbol: {
      type: "simple-fill",  // autocasts as new SimpleFillSymbol()
      color: "orange",
      outline: {  // autocasts as new SimpleLineSymbol()
        width: 4,
        color: "lime"
      }
    }
  }; 

  const parRenderer = {
    type: "unique-value",  // autocasts as new UniqueValueRenderer()
    field: "Koka_suga",
    defaultSymbol: { type: "simple-marker" },  // autocasts as new new SimpleMarkerSymbol()
  };
  

  const punktTemplate = {
    title: "{Akta_nr}",
    content: [
        {
          type: "fields",
          fieldInfos: [
            {
              fieldName: "Parauga_nr"
            },
            {
              fieldName: "Parbaudes_datums"
            },
            {
              fieldName: "Koka_suga"
            },
            {
              fieldName: "Kaitīgie_organismi"
            },
            {
              fieldName: "ObjectId"
            }
          ]
        }
      ],
  };

  const aktTemplate = {
    title: "{Akta_nr}",
    content: [
        {
          type: "fields",
          fieldInfos: [
            {
              fieldName: "Koku_sugas"
            },
            {
              fieldName: "Kaitīgie_organismi"
            },
            {
              fieldName: "ObjectId"
            }
          ]
        }
      ],
  };


  const novaduSlanis = new FeatureLayer({
    //url: "https://services1.arcgis.com/qbu95DaOMntesDTa/arcgis/rest/services/novadi_LV/FeatureServer/0"
    url:"https://services1.arcgis.com/qbu95DaOMntesDTa/ArcGIS/rest/services/Planotas__Administrativas_teritorijas_2021/FeatureServer/0"
  });

  const parauguSlanis = new FeatureLayer({
    url: "https://services1.arcgis.com/3dWrAGXGF8L1iW48/arcgis/rest/services/AKD_MezuParb_Paraugi/FeatureServer",
    outFields: ["*"],
    popupTemplate: punktTemplate
  });
  
  const aktuSlanis = new FeatureLayer({
    url: "https://services1.arcgis.com/3dWrAGXGF8L1iW48/arcgis/rest/services/AKD_MezuParb_Akti/FeatureServer/0",
    renderer: aktRenderer1,
    outFields: ["Akta_nr", "Koku_sugas", "ObjectId", "Pārbaudes_datums"],
    popupTemplate: aktTemplate
  })

  let map = new Map({
    basemap: "gray-vector",
    layers: [novaduSlanis]
  });

  let view = new MapView({
    container: "viewDiv",
    map: map,
    center: [24.23308, 56.96001], // longitude, latitude 
    zoom: 7
  });
    const graphicsLayer = new GraphicsLayer();

    map.add(parauguSlanis);
    map.add(aktuSlanis);
    map.add(graphicsLayer);

  const aktiURL = "https://services1.arcgis.com/3dWrAGXGF8L1iW48/arcgis/rest/services/AKD_MezuParb_Akti/FeatureServer/0/query";
   //"https://services1.arcgis.com/3dWrAGXGF8L1iW48/arcgis/rest/services/akd_mezuparb_akti2021_aug/FeatureServer/0/query";
              
  
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

  const paraugiURL = "https://services1.arcgis.com/3dWrAGXGF8L1iW48/arcgis/rest/services/AKD_MezuParb_Paraugi/FeatureServer/0/query";
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

  //const krasuRinda = [[0, 0, 255], [0, 255, 0], [0, 255, 255], [255, 0, 0], [255, 0, 255], [255, 255, 0], [0, 0, 125], [0, 125, 0], [0, 125, 125], [125, 0, 0], [125, 0, 125], [125, 125, 0], [125, 125, 125], [125, 125, 255], [125, 255, 125], [125, 255, 255], [255, 125, 125], [255, 125, 255], [255, 255, 125], [255, 150, 0], [255, 0, 150], [150, 0, 255], [0, 150, 255], [0, 255, 150], [150, 255, 0], [255, 200, 200], [255, 255, 200], [255, 200, 255], [200, 255, 255], [200, 255, 200], [200, 200, 255], [200, 200, 200]];
  const ramp = colorRamps.byName("Point Cloud 3");
  const krasuRinda = ramp.colors;

  const aktuDalasSpecialasLietas = {
    checkboxClassName: "checkboxes",
    checkAllbuttonName: "checkAll",
    uncheckAllbuttonName: "uncheckAll",
    listesVieta: "listDiv",
    searchField: "Koku_sugas",
    tips: "akti"
  };

  const parauguDalasSpecialasLietas = {
    checkboxClassName: "checkboxes2",
    checkAllbuttonName: "checkAllparaugi",
    uncheckAllbuttonName: "uncheckAllparaugi",
    listesVieta: "listDiv2",
    searchField: "Kaitīgie_organismi",
    tips: "paraugi"
  };

  const kokuDalasSpecialasLietas = {
    checkboxClassName: "checkboxes3",
    checkAllbuttonName: "checkAllpunkti",
    uncheckAllbuttonName: "uncheckAllpunkti",
    listesVieta: "listDiv3",
    searchField: "Koka_suga",
    tips: "koki"
  };

  // constructor
  const NewOne = function (obj) {
    this.checkboxClassName = obj.checkboxClassName;
    this.checkAllbuttonName = obj.checkAllbuttonName;
    this.uncheckAllbuttonName = obj.uncheckAllbuttonName;
    this.listesVieta = obj.listesVieta;
    this.searchField = obj.searchField;
    this.tips = obj.tips;
  };

  //paliek
  NewOne.prototype.createSpeciesList = function(array, domElement) {
    //izveido sarakstu ar čekboksiem no piedāvātā saraksta (parametrā array). DomElement ir, kur sarakstu ievietot.  
    for (let j = 0; j < array.length; j++) {       
      let listItem = document.createElement("li");
      domElement.appendChild(listItem);
      //izveidot čekboksu: element-input, type-checkbox. Tas, kas ir blakus teksts, tas ir label
      let chk = document.createElement("input");
        chk.type = "checkbox";
        chk.value = array[j];
        chk.className = this.checkboxClassName;
        listItem.appendChild(chk);
        let lbl = document.createElement("label");
        lbl.textContent = array[j];
        listItem.appendChild(lbl);
        if (this.tips === "koki") {
          //colorComb - krāsa, lai katrai sugai bumbuļus zīmētu citā krāsā
          visiKoki[array[j]] = [];
          let g = j % krasuRinda.length;
          chk.colorComb = new Color(krasuRinda[g]);
          const obj1 = {
            value: chk.value,
            symbol: {
              type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
              size: 7,
              color: chk.colorComb,
              outline: {  // autocasts as new SimpleLineSymbol()
                width: 1,
                color: "black"
              }
            }
          }
          paraugValueInfos.push(obj1);
          parRenderer.uniqueValueInfos = paraugValueInfos;
          parauguSlanis.renderer = parRenderer;
        } else if (this.tips === "paraugi") {
          visiParaugi[array[j]] = [];
        } else if (this.tips === "akti"){
          visiAkti[array[j]] = [];
        }
    }
  };

  //paliek
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

  //paliek
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

  //paliek
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
          /*  //sadalīt pa semikoliem - šis bija iepriekš, tagad citādāk - ar regexu
          let separateNames = organismi[i].split("; ");
            //jaunos katru kā vienu atsevišķu samest listē organismi1
            for (const nosaukums of separateNames) {
              organismi1.push(nosaukums);
            }  */
            //const regexxx = /\[(.*?)\]/g; šis būtu ar visām [] iekavām
            const regexxx = /(?<=\[).+?(?=\])/g;
            const eppoKodi = organismi[i].match(regexxx);
            if (eppoKodi){
              organismi1.push(...eppoKodi);
            }
        }
          /* //izveidot jaunu listi organismi8, kur atfiltrēti nederīgie (tukšie un redzamie autoru vārdu fragmenti)
          const organismi8 = organismi1.filter(word => (word.length > 4) && (word !== "O'Donnell") && (word !== "Buhrer)"));
          //creating Set from array. Set contains unique values only
          const uniqueSet = new Set(organismi8); */

          // šis tagad jaunajam variantam - salasīt tikai EPPO kodus
          const uniqueSet = new Set(organismi1);
          //back to array from Set
          this.speciesList = [...uniqueSet];
          this.speciesList.sort();
      } else if (this.tips === "akti") {
        for (let i=0; i < response.data.features.length; i++) {
          if (response.data.features[i].attributes[this.searchField]) {
            this.speciesList.push(response.data.features[i].attributes[this.searchField]);     
          }
        }
        const sugas3 = [];
        for (const suga of this.speciesList) {
          const splittedName = suga.split("; ");
          if (splittedName.length === 1 || splittedName.length === 2 || splittedName.length === 3) {
            sugas3.push(suga);
          }
        }
        this.speciesList = sugas3;
        this.speciesList.sort();
        const specList = document.createElement("ol");
        document.getElementById(this.listesVieta).appendChild(specList);
        this.checkAllBoxes();
        this.uncheckAllBoxes();
      }  else {
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
      if (this.tips === "paraugi" || this.tips === "koki"){
        this.chooseSpecies();
      }
    });
  };

  //mainams
  const drawGraphics = function(feature, colOR) {
    // uzzīmēt punktu uz poligona rings pirmā punkta
    // let point = {
    //   type: "point", // autocasts as new Point()
    //   x: feature.x, // 2713841.85385366
    //   y: feature.y,
    //   spatialReference: {
    //     wkid: 3857
    //   }
    // }

    // const gisPoint = webMercatorUtils.webMercatorToGeographic(point);
    
    let markerSymbol = {
      type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
      color: colOR,
      size: 12,
      outline: {
        // autocasts as new SimpleLineSymbol()
        color: [255, 255, 255],
        width: 1
      }
    };
    
    let pointGraphic = new Graphic({
      geometry: feature.point,
      symbol: markerSymbol,
      attributes: feature.attributes,
      popupTemplate: {
        // autocasts as new PopupTemplate()
        title: "{Akta_nr}",
        content: [
          {
            type: "fields",
            fieldInfos: [
              {
                fieldName: "Koku_sugas"
              },
              {
                fieldName: "ObjectId"
              },
              {
                fieldName: "lon"
              },
              {
                fieldName: "lat"
              }
            ]
          }
        ]
      },
      visible: false
    });
    graphicsLayer.add(pointGraphic);
  }

  //gatavs
  NewOne.prototype.chooseSpecies = function() {
    //lai ieķeksējot grafikas parādītos uz kartes un aktu saraksta izveidošana un izķeksējot - grafiku no kartes noņem
    let checkboxes = document.getElementsByClassName(this.checkboxClassName);
      for (const el of checkboxes) {
          el.addEventListener("change", () => {
            const selectedValue = el.value;            
            if (el.checked) {
              if (this.tips === "koki"){
                selectedKokItems.push(selectedValue);
              } else if (this.tips === "paraugi"){
                selectedOrgItems.push(selectedValue);
              } else if (this.tips === "akti"){
                selectedAktItems.push(selectedValue);
              }
            } else {
              if (this.tips === "koki"){
                const index1 = selectedKokItems.indexOf(selectedValue);
                if (index1 > -1) { // only splice array when item is found
                  selectedKokItems.splice(index1, 1); // 2nd parameter means remove one item only
                } 
              } else if (this.tips === "paraugi"){
                const index1 = selectedOrgItems.indexOf(selectedValue);
                if (index1 > -1) { // only splice array when item is found
                  selectedOrgItems.splice(index1, 1); // 2nd parameter means remove one item only
                } 
              } else if (this.tips === "akti"){
                const index1 = selectedAktItems.indexOf(selectedValue);
                if (index1 > -1) { // only splice array when item is found
                  selectedAktItems.splice(index1, 1); // 2nd parameter means remove one item only
                } 
              }
            }
            if (this.tips === "akti") {
                const grlist = graphicsLayer.graphics.items.filter(e => selectedAktItems.indexOf(e.attributes.Koku_sugas) > -1);
                for (const gr of grlist) {
                  gr.visible = true;
                }
                const negList = graphicsLayer.graphics.items.filter(e => selectedAktItems.indexOf(e.attributes.Koku_sugas) < 0);
                for (const gr of negList) {
                  gr.visible = false;
                }

             } else if (this.tips === "paraugi") {
                if (selectedOrgItems.length === 0){
                  punktiLayerView.filter = {
                    where: "1=2"
                  }
                } else {
                  const selectedLongOrgItems = [];
                  for (let org of selectedOrgItems) {
                    let str = `Parauga_nr <>'-' AND Kaitīgie_organismi LIKE '%${org}%'`;
                    selectedLongOrgItems.push(str);
                  }
                  const selectedOrgValues = selectedLongOrgItems.join(" OR ");
                  punktiLayerView.filter = {
                    where: selectedOrgValues
                  }
                }
             } else if (this.tips === "koki") {
               const selectedPointValues = selectedKokItems.join("', '"); 
               punktiLayerView.filter = {
                 where: `Koka_suga IN ('${selectedPointValues}')`
               }
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
  parauguObjekts.dabutSuguSarakstu();
  kokuObjekts.dabutSuguSarakstu();

  
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


  // Te beidzas labošana un sākas pamata lietas, kas notiek lapai ielādējoties
  view.whenLayerView(parauguSlanis).then((layerView) => {
    reactiveUtils.whenOnce(() => !layerView.updating).then(() => {

        // ar šo var sākt domāt par tabulu
        punktiLayerView.queryFeatures({
          //geometry: view.extent, te var ielikt no - līdz
          returnGeometry: true
        })
        .then(function(results) {
          // do something with the resulting graphics
          rawPointObj = results.features;
          rawPointObj.forEach((elem) => {
            const obj2 = {};
            obj2.attributes = elem.attributes;
            obj2.latitude = elem.geometry.latitude;
            obj2.longitude = elem.geometry.longitude;
            for (const item in visiKoki){
              if(elem.attributes.Koka_suga === item){
                visiKoki[item].push(obj2);
              }
            }
            if (elem.attributes["Kaitīgie_organismi"] && elem.attributes.Parauga_nr !== "-") {
              for (const item in visiParaugi){
                const orgRinda = elem.attributes["Kaitīgie_organismi"];
                if(orgRinda.includes(item)){
                  visiParaugi[item].push(obj2);
                }
              }
            }
          });
          console.log("objects are ready");
          const listDivKoki = document.getElementById(kokuObjekts.listesVieta);
          const labelListKoki = listDivKoki.getElementsByTagName("label");
          for (const lab of labelListKoki){
            for (const koksElem in visiKoki){
              if (koksElem === lab.textContent){
                const parentNode = lab.parentNode;
                const aktiDiv = document.createElement("div");
                aktiDiv.className = "akti";
                parentNode.appendChild(aktiDiv);
                lab.addEventListener("click", (e) => {
                  for (const el of visiKoki[koksElem]) {
                    //katram no aktu numuriem izveido savu p
                    let p = document.createElement("p");
                    p.textContent = `${el.longitude}; ${el.latitude}; ${el.attributes.Akta_nr}; ${el.attributes.ObjectId};`;
                    aktiDiv.appendChild(p);
                  }
                  e.target.addEventListener("click", () => {
                    let divs = lab.parentNode.getElementsByTagName("div");
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
          }
          console.log("koki section is ready");
          document.getElementById("kokipz").textContent = "Koki gatavi";
          const listDivParaugi = document.getElementById(parauguObjekts.listesVieta);
          const labelListParaugi = listDivParaugi.getElementsByTagName("label");
          for (const lab of labelListParaugi){
            for (const parElem in visiParaugi){
              if (parElem.includes(lab.textContent)){
                const parentNode = lab.parentNode;
                const aktiDiv = document.createElement("div");
                aktiDiv.className = "akti";
                parentNode.appendChild(aktiDiv);
                lab.addEventListener("click", (e) => {
                  for (const el of visiParaugi[parElem]) {
                    //katram no aktu numuriem izveido savu p
                    let p = document.createElement("p");
                    p.textContent = `${el.longitude}; ${el.latitude}; ${el.attributes.Akta_nr}; ${el.attributes.Parauga_nr}; ${el.attributes["Kaitīgie_organismi"]} ${el.attributes.ObjectId};`;
                    aktiDiv.appendChild(p);
                  }
                  e.target.addEventListener("click", () => {
                    let divs = lab.parentNode.getElementsByTagName("div");
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
          }
          console.log("paraugi section is ready");
          document.getElementById("paraugipz").textContent = "Paraugi gatavi";         
        }); // te beidzas falseOnce       
      });

    layerView.watch("updating", function(value) { /// !!!
      if (!value) {       
        punktiLayerView = layerView;
      }
    });
  });

  view.whenLayerView(aktuSlanis).then((layerView) => {
    reactiveUtils.whenOnce(() => !layerView.updating).then(() => {
      aktiLayerView = layerView;

      // aktiLayerView.queryFeatures({
      //     //geometry: searchPolygon,
      //     returnGeometry: true
      //   })
      aktuSlanis.queryFeatures().then(function(results) {
          rawPolyObj = results.features
          const hidePolygons = document.getElementById("clearPolyg");
          hidePolygons.addEventListener("click", () => {
            aktiLayerView.visible ? aktiLayerView.visible = false : aktiLayerView.visible = true;
          });
          rawPolyObj.forEach((elem) => {
            const obj3 = {};
            for (const item in visiAkti){
              if ((elem.attributes.Koku_sugas === item) && (elem.geometry.rings.length > 0)){
                const x1 = elem.geometry.rings[0][0][0];
                const y1 = elem.geometry.rings[0][0][1];
                obj3.attributes = elem.attributes;
                const pointt = {
                  type: "point", // autocasts as new Point()
                  x: x1, // 2713841.85385366
                  y: y1,
                  spatialReference: {
                    wkid: 3857
                  }
                }
                obj3.point = pointt;
                const gisPoint = webMercatorUtils.webMercatorToGeographic(pointt);
                obj3.attributes.lon = gisPoint.x;
                obj3.attributes.lat = gisPoint.y;
                visiAkti[item].push(obj3);
              }
            }
          });
          const listDivAkti = document.getElementById(aktuObjekts.listesVieta);
          const labelListAkti = listDivAkti.getElementsByTagName("label");
          for (const lab of labelListAkti){
            for (const aktsElem in visiAkti){
              if (aktsElem === lab.textContent){
                const parentNode = lab.parentNode;
                const aktiDiv = document.createElement("div");
                aktiDiv.className = "akti";
                parentNode.appendChild(aktiDiv);
                lab.addEventListener("click", (e) => {
                  for (const el of visiAkti[aktsElem]) {
                    //katram no aktu numuriem izveido savu p
                    let p = document.createElement("p");
                    p.textContent = `${el.attributes.lon}; ${el.attributes.lat}; ${el.attributes.Akta_nr}; ${el.attributes.ObjectId};`;
                    aktiDiv.appendChild(p);
                  }
                  e.target.addEventListener("click", () => {
                    let divs = lab.parentNode.getElementsByTagName("div");
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
          }
           // Sazīmēt punktus uz rings[0][0][0]
          let colorCounter = 1;
          for (let key in visiAkti){
            const collor = new Color(krasuRinda[colorCounter]);
              colorCounter +=1;
              if (colorCounter > krasuRinda.length){
                colorCounter = 0;
              }
              for (let elem of visiAkti[key]){
                drawGraphics(elem, collor);
              }
          }
           aktuObjekts.chooseSpecies();
          console.log("aktu slānis gatavs");
          document.getElementById("aktipz").textContent = "Akti gatavi";
        }); // te beidzas falseOnce       
      });
  });

});

