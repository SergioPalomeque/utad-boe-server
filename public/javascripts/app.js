var hostDomain = 'http://localhost:8080';
var urlBoeDoc = 'http://boe.es/diario_boe/txt.php?id=';
var xmlMainBoe = 'http://boe.es/diario_boe/xml.php?id=BOE-S-';
var global = {
  pageNumber: 0,
  pageSize: 10,
  boesSelected: []
};

var socket = io(hostDomain, {transports: ['websocket']});

function scrollDown () {
  window.scrollTo(0,document.body.scrollHeight);
}

function showLog (msg) {
  $('#messages').append(msg);
  scrollDown()
}

socket.on('mainBoe', function (boeId) {
  var url = xmlMainBoe + boeId;
  showLog('<p class="message"><a href="'+ url +'" target="_blank">Boe principal: '+ url +'</a></p>')
});

socket.on('boeInserted', function (boeId) {
  var url = urlBoeDoc + boeId;
  showLog('<p class="message"><a href="'+ url +'" target="_blank">'+ url +'</a></p>')
});

socket.on('distanceProcess', function (message) {
  showLog('<p class="message">'+ message +'</p>')
});

socket.on('distanceProcessEnd', function () {
  showLog('<p class="message">¡Fin del proceso!</p>')
})

function startDistanceProcess () {
  socket.emit('execCosineDistanceProcess');
}

function startDownloadBoes () {
  var from = $('#fromDatePicker input').val();
  var until = $('#untilDatePicker input').val();
  var data = {
    from: moment(from).format('YYYY-MM-DD'),
    until:moment(until).format('YYYY-MM-DD')
  };
  console.log(JSON.stringify(data));
  socket.emit('startSaveBoesEvent', data);
}

function stopDownloadBoes () {
  socket.emit('stopSaveBoesEvent');
}

function removeBoes () {
  $.ajax({
    url: hostDomain + '/api/1/boes',
    type: 'DELETE',
    success: function (result) {
      $('#boes_list tbody tr').remove();
      $('#current_page').html('');
      $('#number_page').html('');
    },
    error: function () {

    }
  })
}

function getBoes () {
  $.get(hostDomain + '/api/1/boes?pageNumber=' + global.pageNumber + '&pageSize=' + global.pageSize, function (data) {
    var html = '';
    var boes = data.data;
    boes.forEach(function (boe, index) {
      var boeIndex = getBoeSelectedIndex(boe._id);
      var boeSelected = boeIndex > -1 ? 'boe_selected' : '';
      html += '<tr class="' + boeSelected + '" data-mongo-id="'+ boe._id +'"><th scope="row">' + (global.pageSize * global.pageNumber + index + 1) + '</th><td>' + boe.boeId + '</td><td>' + moment(boe.date).format('DD-MM-YYYY') + '</td><td><a href="'+ urlBoeDoc + boe.boeId + '" target="_blank"><span class="glyphicon glyphicon-new-window" aria-hidden="true"></span></a></td></tr>'
    });
    $('#boes_list tbody').html(html);
    if (boes.length > 0) {
      $('#current_page').html(data.pageNumber + 1);
      $('#number_page').html(data.maxPages);
    } else {
      $('#current_page').html(0);
      $('#number_page').html(0);
    }
  });
}

function getMoreBoes () {
  global.pageNumber++;
  getBoes();
}

function getLessBoes () {
  if (global.pageNumber - 1 < 0) return;
  global.pageNumber--;
  getBoes();
}

function getBoeSelectedIndex (mongoId) {
  var index = global.boesSelected.indexOf(mongoId);
  return index
}

function selectBoe () {
  var element = $(this);
  var mongoId = element.data('mongo-id');
  if (element.hasClass('boe_selected')) {
    var index = getBoeSelectedIndex(mongoId)
    if (index > -1) {
      global.boesSelected.splice(index, 1);
    }
    element.removeClass('boe_selected');
  } else {
    global.boesSelected.push(mongoId);
    element.addClass('boe_selected');
  }
}

function buildDistanceQuery () {
  var query = '';
  global.boesSelected.forEach(function (boe) {
    query += 'boes='+ boe +'&'
  });
  return query;
}

function loadGraph () {
  d3.select("svg").remove();
  var spinner = $(this).find('.glyphicon');
  if (global.boesSelected.length > 1) {
    spinner.removeClass('hide').addClass('spinning');
    $.get('http://localhost:8080/api/1/boes/distances?'+ buildDistanceQuery(), function (response) {
      initGraph();
      ready(null, response.boes, response.matrixDistance);
      spinner.removeClass('spinning').addClass('hide');
    });
  } else {
    $('#boesSelectedError').removeClass('collapse').addClass('fade in')
  }
}

function getRandomColor () {
  var letters = '0123456789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++ ) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

var formatPercent, arc, layout, path, svg;

function initGraph () {
  var width = 520,
      height = 520,
      outerRadius = Math.min(width, height) / 2 - 10,
      innerRadius = outerRadius - 24;

  formatPercent = d3.format('.1%');

  arc = d3.svg.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);

  layout = d3.layout.chord()
    .padding(.04)
    .sortSubgroups(d3.descending)
    .sortChords(d3.ascending);

  path = d3.svg.chord()
    .radius(innerRadius);

  svg = d3.select('#graph').append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('id', 'circle')
    .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

  svg.append('circle')
    .attr('r', outerRadius);
}


function ready(error, boesDocuments, matrix) {
  if (error) throw error;

  boesDocuments.forEach(function (city) {
    city.color = getRandomColor();
  });
  // Compute the chord layout.
  layout.matrix(matrix);

  // Add a group per neighborhood.
  var group = svg.selectAll('.group')
    .data(layout.groups)
    .enter().append('g')
    .attr('class', 'group')
    .on('mouseover', mouseover)
    .on('click', openDocument);

  // Add a mouseover title.
  group.append('title').text(function (d, i) {
    return boesDocuments[i].boeId + ': ' + formatPercent(d.value) + ' of origins';
  });

  // Add the group arc.
  var groupPath = group.append('path')
    .attr('id', function (d, i) {
      return 'group' + i;
    })
    .attr('d', arc)
    .style('fill', function (d, i) {
      return boesDocuments[i].color;
    });

  // Add a text label.
  var groupText = group.append('text')
    .attr('x', 6)
    .attr('dy', 15);

  groupText.append('textPath')
    .attr('xlink:href', function (d, i) {
      return '#group' + i;
    })
    .text(function (d, i) {
      return boesDocuments[i].boeId;
    });

  // Remove the labels that don't fit. :(
  groupText.filter(function (d, i) {
    return groupPath[0][i].getTotalLength() / 2 - 16 < this.getComputedTextLength();
  }).remove();

  // Add the chords.
  var chord = svg.selectAll('.chord')
    .data(layout.chords)
    .enter().append('path')
    .attr('class', 'chord')
    .style('fill', function (d) {
      return boesDocuments[d.source.index].color;
    })
    .attr('d', path);

  // Add an elaborate mouseover title for each chord.
  chord.append('title').text(function (d) {
    return boesDocuments[d.source.index].boeId
      + ' <--> ' + boesDocuments[d.target.index].boeId
      + ': ' + formatPercent(d.source.value);
  });

  function mouseover (d, i) {
    chord.classed('fade', function (p) {
      return p.source.index != i
          && p.target.index != i;
    });
  }

  function openDocument (d, i) {
    var win = window.open(urlBoeDoc + boesDocuments[i].boeId, '_blank');
    win.focus();
  }
}


$(function () {
  console.log("ready!");
  getBoes();
  $('#pager_next').on('click', getMoreBoes);
  $('#pager_previous').on('click', getLessBoes);
  $('#boes_list').on('click', 'tbody tr', selectBoe);
  $('#load_graph').on('click', loadGraph);
  $('#boes_list').on('click', 'tbody tr td a', function (e) {
    e.stopPropagation();
  });
  $('#download_boes').on('click', startDownloadBoes);
  $('#stop_download_boes').on('click', stopDownloadBoes);
  $('#remove_boes').on('click', removeBoes);
  $('#fromDatePicker').datetimepicker();
  $('#untilDatePicker').datetimepicker();
  $('#start_distance_process').on('click', startDistanceProcess);
});
