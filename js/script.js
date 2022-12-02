const getBD = () => JSON.parse(localStorage.getItem("DbAtividade")) ?? [];
const setBD = () =>
  localStorage.setItem("DbAtividade", JSON.stringify(state.data));

// Variaveis Iniciais Globais
let state = {
  milisecSave: 0,
  sec: 0,
  min: 0,
  hr: 0,
  interval: 0,
  data: getBD(),
  editRecord: false,
  recordEdited: 0,
  modoConsulta: false
};

//Variaveis exclusivas da Paginação
let statePagination = {
  myAlertOk: false,
  myAlertConfirm: false,
  paginaAtual: 0,
  page: 1,
  perPage: 8,
  totalPage: Math.ceil(state.data.length / this.perPage),
  maxVisibleButtons: 3,
  edit: false,
};

// Objeto de Tags pelo ID
const html = {
  getById(element) {
    return document.getElementById(element);
  },
};

//Inicial
const myLoad = {
  initialize() {
    search.searchDisable(false);
    state.data = getBD();
    list.update();
    html.getById("buttontimer").style.display = "block";
    html.getById("botaoSearch").style.display = "none";
    html.getById("m-list").innerHTML = "";
    list.update();
    if (state.data.length === 0) {
      html.getById("tablecontainer").style.display = "none";
      html.getById("pagination").style.display = "none";
      html.getById("body").style.height = "220px";
    } else {
      html.getById("tablecontainer").style.display = "block";
      html.getById("pagination").style.display = "flex";
      html.getById("body").style.height = "768px";
    }
  },
  createItemonTable(item, index) {
    let tr = document.createElement("tr");
    tr.innerHTML = `
      <td width="150px">${item.usuario}</td>
      <td width="150px">${item.atividade}</td>
      <td width="150px">${item.tipodeatividade}</td>
      <td width="150px">${item.tempo}</td>
      <td width="0px" hidden="true" >${index}</td>
      <td width="10px" class="optionsTable" onclick= "dataBase.read(${index})" ><i class='bx bx-edit'></td>
      <td width="10px" class="optionsTable" onclick= "dataBase.delete(${index})" ><i class='bx bx-trash'></td>
    `;
    html.getById("m-list").appendChild(tr);
  }
};

// Cronômetro
const timeControl = {
  myDisable(tf) {
    html.getById("m-usuario").disabled = tf;
    html.getById("m-atividade").disabled = tf;
    html.getById("m-tipodeatividade").disabled = tf;
    html.getById("m-pesquisa").disabled = tf;
    html.getById("m-filtro").disabled = tf;
    html.getById("m-buttonSearch").disabled = tf;
    html.getById("m-clearSearch").disabled = tf;
  },
  start() {
    if (
      html.getById("m-usuario").value == "" ||
      html.getById("m-atividade").value == "" ||
      html.getById("m-tipodeatividade").value == ""
    ) {
      if (state.milisecSave <= 0) {
        var result = confirm(
          "Existem campos vazios.\nTem certeza que deseja começar o cronômetro mesmo assim ?"
        );
        if (result) {
          timeControl.startComplete();
        } else {
          html.getById("m-usuario").focus();
        }
      } else {
        timeControl.startComplete();
      }
    } else {
      timeControl.startComplete();
    }
  },
  startComplete() {
    timeControl.watch();
    state.interval = setInterval(timeControl.watch, 1000);
    timeControl.myDisable(true);
    html.getById("pause").className = "bx bx-pause";
    html.getById("start").title = "Iniciar";
    html.getById("start").className = "";
  },
  pause() {
    if (state.sec > 0) {
      clearInterval(state.interval);
      html.getById("pause").className = "";
      html.getById("start").className = "bx bx-play";
      html.getById("start").title = "Retomar";
    }
  },
  stop() {
    if (state.sec > 0) {
      dataBase.create(); // Acrescenta a tabela ou altera se estiver liberado os botoes do tempo
      dataBase.inputSetClear();
    }
  },
  watch() {
    state.milisecSave++;
    state.sec++;
    if (state.sec == 60) {
      state.min++;
      state.sec = 0;
      if (state.min == 60) {
        state.min = 0;
        state.hr++;
      }
    }
    html.getById("watch").innerText =
      timeControl.myFormat(state.hr, 2) +
      ":" +
      timeControl.myFormat(state.min, 2) +
      ":" +
      timeControl.myFormat(state.sec, 2);
  },
  myFormat(numero, digitos) {
    return numero.toLocaleString("pt-BR", {
      minimumIntegerDigits: digitos,
      useGrouping: false,
    });
  },
};

//Pesquisa
const search = {
  searchDisable(tf) {
    html.getById("m-buttonSearch").disabled = tf;
    html.getById("m-filtro").disabled = tf;
    //html.getById("m-clearSearch").disabled = tf;
    html.getById("m-buttonLupa").disabled = tf;
    html.getById("m-pesquisa").disabled = tf;
    dataBase.enableInput(tf);
  },
  mySearch(pesquisa, filtro) {
    dataBase.saveBackup();
    filtro == 0 ? filtro=1: filtro
    if (filtro == 1) {
      var filtrado = state.data.filter(
        (obj) => obj.usuario.indexOf(pesquisa.toUpperCase()) != -1
      );
    }
    if (filtro == 2) {
      var filtrado = state.data.filter(
        (obj) => obj.atividade.indexOf(pesquisa.toUpperCase()) != -1
      );
    }
    if (filtro == 3) {
      var filtrado = state.data.filter(
        (obj) => obj.tipodeatividade.indexOf(pesquisa.toUpperCase()) != -1
      );
    }
    if (parseInt(filtrado.length) > 0) {
      state.data = filtrado;
      search.searchDisable(true);
      setBD();
    } else {
      dataBase.restoreBackup();
    }
  },
  clearSearch() {
    pesquisa = "";
    filtro = "";
    search.searchDisable(false);
    dataBase.restoreBackup();
  },
};

// dataBase
const dataBase = {
  create() {
    dataBase.addTime();
    /*Rotina Create Aprimorada e substituida pela addTime....
    juntei as duas, separar quando fazer a biblioteca para crud*/
  },
  read(index) {
    state.editRecord = true;
    search.searchDisable(true);
    dataBase.enableInput(false);
    index = state.recordEdited =
      index + (statePagination.page - 1) * statePagination.perPage;
    html.getById("m-index").value = index;
    html.getById("m-usuario").value = state.data[index].usuario;
    html.getById("m-atividade").value = state.data[index].atividade;
    html.getById("m-tipodeatividade").value = state.data[index].tipodeatividade;
    html.getById("watch").innerHTML = state.data[index].tempo;
    state.milisecSave = state.data[index].tempoSegundos;
    state.sec = state.data[index].tempoSegundos;
    html.getById("buttontimer").style.display = "none";
    //Diminuir aqui o tamanho da tela e aparecer o botao save
    html.getById("botaoSearch").style.display = "block";
    html.getById("m-usuario").focus();
  },
  update() {
    state.data[state.recordEdited].usuario = html
      .g("m-usuario")
      .value.toUpperCase();
    state.data[state.recordEdited].atividade = html
      .g("m-atividade")
      .value.toUpperCase();
    state.data[state.recordEdited].tipodeatividade = html
      .g("m-tipodeatividade")
      .value.toUpperCase();
    state.data[state.recordEdited].tempo = html.getById("watch").innerHTML;
    state.data[state.recordEdited].tempoSegundos = state.milisecSave;
    state.editRecord = false;
    state.recordEdited = 0;
    //setBD();
    alert("Atividade editada com sucesso !");
    init();
  },
  updateByButton() {
    if (state.editRecord) {
      if (
        html.getById("m-usuario").value.trim() == "" ||
        html.getById("m-atividade").value.trim() == "" ||
        html.getById("m-tipodeatividade").value.trim() == ""
      ) {
        var result = confirm(
          "Existem campos vazios.\nTem certeza que deseja salvar mesmo assim ?"
        );
        if (!result) {
          html.getById("m-usuario").focus();
          return;
        }
      }
      var controle = html.getById("m-index").value;
      state.data[controle].usuario = html.getById("m-usuario").value.toUpperCase();
      state.data[controle].atividade = html
        .g("m-atividade")
        .value.toUpperCase();
      state.data[controle].tipodeatividade = html
        .g("m-tipodeatividade")
        .value.toUpperCase();
      state.editRecord = false;
      state.recordEdited = 0;

      setBD();

      //Se for na consulta
      if (localStorage.getItem("DbBackup")) {
        //Fazer a busca pelo (filter) registro para poder atualizar
        var registroBuscardor = state.data[controle].registro;
        var arrayTemp = JSON.parse(localStorage.getItem("DbBackup"));

        arrayTemp.forEach((item, index) => {
          if (item.registro == registroBuscardor) {
            arrayTemp[index].usuario = html.getById("m-usuario").value.toUpperCase();
            arrayTemp[index].atividade = html
              .g("m-atividade")
              .value.toUpperCase();
            arrayTemp[index].tipodeatividade = html
              .g("m-tipodeatividade")
              .value.toUpperCase();
            arrayTemp[index].tempo = html.getById("watch").innerHTML;
            arrayTemp[index].tempoSegundos = state.milisecSave;
          }
        });
        localStorage.setItem("DbBackup", JSON.stringify(arrayTemp));
      }
      //
      dataBase.inputSetClear();
      setBD();
      alert("Atividade editada com sucesso !");
      html.getById("botaoSearch").style.display = "none";
      init();
    }
  },
  delete(index) {
    index = index + (statePagination.page - 1) * statePagination.perPage;
    var resultado = confirm(
      "Registro do usuario : " +
        state.data[index].usuario +
        "\n" +
        "Atividade : " +
        state.data[index].atividade +
        "\n" +
        "Tipo de Atividade : " +
        state.data[index].tipodeatividade +
        "\n" +
        "Tempo Decorrido : " +
        state.data[index].tempo +
        "\n" +
        "Deseja realmente escluir esse registro ?"
    );
    if (resultado) {
      if (localStorage.getItem("DbBackup")) {
        var registroBuscardor = state.data[index].registro;
        var arrayTemp = JSON.parse(localStorage.getItem("DbBackup"));
        arrayTemp.forEach((item, index) => {
          if (item.registro == registroBuscardor) {
            arrayTemp.splice(index, 1);
          }
        });
        localStorage.setItem("DbBackup", JSON.stringify(arrayTemp));
      }
      state.data.splice(index, 1);
      setBD();
      dataBase.order();
      if (localStorage.getItem("DbBackup")) {
        dataBase.restoreBackup();        
      }
      document.location.reload();
      alert("Excluido com sucesso !");
      init();
    }
  },
  inputSetClear() {
    timeControl.myDisable(false);
    html.getById("pause").className = "bx bx-pause";
    html.getById("start").className = "bx bx-play";
    html.getById("start").title = "Iniciar";

    html.getById("m-usuario").value = "";
    html.getById("m-atividade").value = "";
    html.getById("m-tipodeatividade").value = "";
    html.getById("m-pesquisa").value = "";

    clearInterval(state.interval);
    html.getById("watch").innerText = "00:00:00";
    html.getById("m-usuario").focus();
    state.hr = 0;
    state.sec = 0;
    state.min = 0;
    state.milsec = 0;
    state.milisecSave = 0;
    state.editRecord = false;
    statePagination.paginaAtual = 0;
    statePagination.page = 1;
    statePagination.perPage = 8;
    statePagination.totalPage = Math.ceil(
      state.data.length / statePagination.perPage
    );
  },
  saveBackup() {
    if (!localStorage.getItem("DbBackup")) {
      localStorage.setItem("DbBackup", JSON.stringify(state.data));
    }
  },
  restoreBackup() {
    if (localStorage.getItem("DbBackup")) {
      state.data = JSON.parse(localStorage.getItem("DbBackup"));
      setBD();
      localStorage.removeItem("DbBackup");
    }
  },
  populated() {
    state.data.push({
      usuario: "LETICIA",
      atividade: "AULA",
      tipodeatividade: "ESCOLA",
      tempo: "00:00:20",
      temposegundos: 20,
    });
    state.data.push({
      usuario: "LETICIA",
      atividade: "AULA",
      tipodeatividade: "ESCOLA",
      tempo: "00:00:20",
      temposegundos: 20,
    });
    state.data.push({
      usuario: "LETICIA",
      atividade: "AULA",
      tipodeatividade: "ESCOLA",
      tempo: "00:00:20",
      temposegundos: 20,
    });
    state.data.push({
      usuario: "LETICIA",
      atividade: "AULA",
      tipodeatividade: "ESCOLA",
      tempo: "00:00:20",
      temposegundos: 20,
    });
    state.data.push({
      usuario: "LETICIA",
      atividade: "AULA",
      tipodeatividade: "ESCOLA",
      tempo: "00:00:20",
      temposegundos: 20,
    });
    state.data.push({
      usuario: "RAFAEL",
      atividade: "AULA",
      tipodeatividade: "ESCOLA",
      tempo: "00:00:50",
      temposegundos: 50,
    });
    state.data.push({
      usuario: "RAFAEL",
      atividade: "AULA",
      tipodeatividade: "ESCOLA",
      tempo: "00:00:50",
      temposegundos: 50,
    });
    state.data.push({
      usuario: "RAFAEL",
      atividade: "AULA",
      tipodeatividade: "ESCOLA",
      tempo: "00:00:50",
      temposegundos: 50,
    });
    state.data.push({
      usuario: "RAFAEL",
      atividade: "AULA",
      tipodeatividade: "ESCOLA",
      tempo: "00:00:50",
      temposegundos: 50,
    });
    state.data.push({
      usuario: "RAFAEL",
      atividade: "AULA",
      tipodeatividade: "ESCOLA",
      tempo: "00:00:50",
      temposegundos: 50,
    });
    state.data.push({
      usuario: "TUTY",
      atividade: "VACINA",
      tipodeatividade: "VETERINÁRIO",
      tempo: "00:00:30",
      temposegundos: 30,
    });
    state.data.push({
      usuario: "TUTY",
      atividade: "VACINA",
      tipodeatividade: "VETERINÁRIO",
      tempo: "00:00:30",
      temposegundos: 30,
    });
    state.data.push({
      usuario: "TUTY",
      atividade: "VACINA",
      tipodeatividade: "VETERINÁRIO",
      tempo: "00:00:30",
      temposegundos: 30,
    });
    state.data.push({
      usuario: "TUTY",
      atividade: "VACINA",
      tipodeatividade: "VETERINÁRIO",
      tempo: "00:00:30",
      temposegundos: 30,
    });
    state.data.push({
      usuario: "TUTY",
      atividade: "VACINA",
      tipodeatividade: "VETERINÁRIO",
      tempo: "00:00:30",
      temposegundos: 30,
    });
    setBD();
    document.location.reload();
    init();
  },
  addTime() {
    var sUsuario = html.getById("m-usuario").value.toUpperCase().trim();
    var sAtividade = html.getById("m-atividade").value.toUpperCase().trim();
    var sTipoDeAtividade = html
      .getById("m-tipodeatividade")
      .value.toUpperCase()
      .trim();
    var filtrado = ([] = state.data.filter(
      (obj) =>
        obj.usuario.toUpperCase().trim() == sUsuario &&
        obj.atividade.toUpperCase().trim() == sAtividade &&
        obj.tipodeatividade.toUpperCase().trim() == sTipoDeAtividade
    ));
    if (parseInt(filtrado.length) === 0) {
      if (!state.editRecord) {
        state.data = getBD();
        let Inclusao = {
          usuario: html.getById("m-usuario").value.toUpperCase(),
          atividade: html.getById("m-atividade").value.toUpperCase(),
          tipodeatividade: html.getById("m-tipodeatividade").value.toUpperCase(),
          tempo: html.getById("watch").innerHTML,
          tempoSegundos: state.milisecSave,
          registro: state.data.length,
        };
        //Se for na consulta
        if (localStorage.getItem("DbBackup")) {
          arrayTemp = JSON.parse(localStorage.getItem("DbBackup"));
          Inclusao.registro = arrayTemp.length;
          state.data.push(Inclusao);
          setBD();
          arrayTemp.push(Inclusao);
          localStorage.setItem("DbBackup", JSON.stringify(arrayTemp));
          //dataBase.restoreBackup();
          alert("Atividade adicionada com sucesso !!");
        } else {
          // Se for consulta Dar o push apenas depois de ganhar o numero de registro o backup.
          state.data.push(Inclusao);
          alert("Atividade adicionada com sucesso !");
        }
      }
    } else {
      filtrado[0].tempoSegundos += state.milisecSave;
      hours = Math.floor(filtrado[0].tempoSegundos / 3600);
      minutes = Math.floor((filtrado[0].tempoSegundos - hours * 3600) / 60);
      seconds = filtrado[0].tempoSegundos - hours * 3600 - minutes * 60;
      totalTime =
        timeControl.myFormat(hours, 2) +
        ":" +
        timeControl.myFormat(minutes, 2) +
        ":" +
        timeControl.myFormat(seconds, 2);
      filtrado[0].tempo = totalTime;
      alert("Tempo da atividade atualizada com sucesso !");

      //Se for na consulta
      if (localStorage.getItem("DbBackup")) {
        //Fazer a busca pelo (filter) registro para poder atualizar
        var registroBuscardor = filtrado[0].registro;
        var arrayTemp = JSON.parse(localStorage.getItem("DbBackup"));

        arrayTemp.forEach((item, index) => {
          if (item.registro == registroBuscardor) {
            arrayTemp[index].usuario = html.getById("m-usuario").value.toUpperCase();
            arrayTemp[index].atividade = html
              .g("m-atividade")
              .value.toUpperCase();
            arrayTemp[index].tipodeatividade = html
              .g("m-tipodeatividade")
              .value.toUpperCase();
            arrayTemp[index].tempo = totalTime;
            arrayTemp[index].tempoSegundos += state.milisecSave;
          }
        });
        localStorage.setItem("DbBackup", JSON.stringify(arrayTemp));
      }
      //
    }
    setBD();
    state.data = getBD();
    myLoad.initialize();
    init();
  },
  order() {
    if (localStorage.getItem("DbBackup")) {
      state.data = JSON.parse(localStorage.getItem("DbBackup"));
      state.data.forEach((item, index) => {
        item.registro = index;
      });
      setBD();
      localStorage.setItem("DbBackup", JSON.stringify(state.data));
    } else {
      state.data = getBD();
      state.data.forEach((item, index) => {
        item.registro = index;
      });
      setBD();
    }
  },
  enableInput(tf){
    html.getById("m-usuario").disabled = tf;
    html.getById("m-atividade").disabled = tf;
    html.getById("m-tipodeatividade").disabled = tf;
  }
};

// Tabela
const table = {
  getSortOrder(prop, order) {
    if (order) {
      return function (a, b) {
        if (a[prop] > b[prop]) {
          return 1;
        } else if (a[prop] < b[prop]) {
          return -1;
        }
        return 0;
      };
    } else {
      return function (a, b) {
        if (b[prop] > a[prop]) {
          return 1;
        } else if (b[prop] < a[prop]) {
          return -1;
        }
        return 0;
      };
    }
  },
  sortByUsuario(order) {
    state.data = getBD();
    state.data.sort(table.getSortOrder("usuario", order));
    setBD();
    document.location.reload();
    init();
  },
  sortByAtividade(order) {
    state.data = getBD();
    state.data.sort(table.getSortOrder("atividade", order));
    setBD();
    document.location.reload();
    init();
  },
  sortByTipoDeAtividade(order) {
    state.data = getBD();
    state.data.sort(table.getSortOrder("tipodeatividade", order));
    setBD();
    document.location.reload();
    init();
  },
  sortByTempo(order) {
    state.data = getBD();
    state.data.sort(table.getSortOrder("tempo", order));
    setBD();
    document.location.reload();
    init();
  },
};

// Paginação
const controls = {
  next() {
    if (statePagination.page < statePagination.totalPage) {
      statePagination.page++;
      const lasPage = statePagination.page > statePagination.totalPage;
      if (lasPage) {
        statePagination.page--;
      }
    }
  },
  prev() {
    statePagination.page--;
    statePagination.page < 1
      ? (statePagination.page = 1)
      : statePagination.page;
  },
  goTo(page) {
    page < 1 ? (page = 1) : +page;
    statePagination.page =
      page > statePagination.totalPage ? statePagination.totalPage : +page;
  },
  createListeners() {
    html.getById("m-first").addEventListener("click", () => {
      controls.goTo(1);
      list.update();
    });
    html.getById("m-last").addEventListener("click", () => {
      controls.goTo(statePagination.totalPage);
      list.update();
    });
    html.getById("m-next").addEventListener("click", () => {
      controls.next();
      list.update();
    });
    html.getById("m-prev").addEventListener("click", () => {
      controls.prev();
      list.update();
    });
  },
};

const list = {
  create(item, index) {
    let tr = document.createElement("tr");
    tr.innerHTML = `
      <td width="130px">${item.usuario}</td>
      <td width="150px">${item.atividade}</td>
      <td width="150px">${item.tipodeatividade}</td>
      <td width="150px">${item.tempo}</td>
      <td width="0px" hidden="true" >${index}</td>
      <td width="10px" class="optionsTable" onclick= "dataBase.read(${index})" ><i class='bx bx-edit'></td>
      <td width="10px" class="optionsTable" onclick= "dataBase.delete(${index})" ><i class='bx bx-trash'></td>
    `;
    html.getById("m-list").appendChild(tr);
  },
  update() {
    html.getById("m-list").innerHTML = "";
    let page = statePagination.page - 1;
    let start = page * statePagination.perPage;
    let end = start + statePagination.perPage;
    state.data = getBD();
    const paginatedItems = state.data.slice(start, end);
    paginatedItems.forEach((item, index, arrayData) => {
      list.create(item, index);
    });
    html.getById("m-page").innerText = statePagination.page;
  },
};

//Inicializa
function init() {
  var urlParams = new URLSearchParams(window.location.search);
  var pesquisa = urlParams.get("pesquisa");
  var filtro = urlParams.get("filtro");
  if (pesquisa) {
    search.mySearch(pesquisa, filtro);
    pesquisa = "";
    filtro = "";
    window.location = "index.html";
  }
  dataBase.inputSetClear();
  myLoad.initialize();
  list.update();
  controls.createListeners();
  if (localStorage.getItem("DbBackup")) {
    search.searchDisable(true);
    html.getById("m-clearSearch").innerHTML = 'X'
    html.getById("m-clearSearch").style.backgroundColor ='#50f450'
    html.getById("m-clearSearch").style.color ='black'
    html.getById("m-clearSearch").style.fontWeight ='bold'
    html.getById("buttontimer").style.display = 'none'
  }
}

init();
