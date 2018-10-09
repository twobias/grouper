var init = function () {
  setSortables();
  $("#spinner").spinner({
    spin: function (event, ui) {
      if ( ui.value > 16 ) {
        $( this ).spinner( "value", 2 );
        groupsOfN(2);
        return false;
      } else if ( ui.value < 1 ) {
        $( this ).spinner( "value", 10 );
        groupsOfN(10);
        return false;
      }
      groupsOfN(ui.value);
    }
  });
  $("#spinnerN").spinner({
    spin: function (event, ui) {
      if ( ui.value > 28 ) {
        $( this ).spinner( "value", 1 );
        nGroups(1);
        return false;
      } else if ( ui.value < 1 ) {
        $( this ).spinner( "value", 28 );
        nGroups(28);
        return false;
      }
      nGroups(ui.value);
    }
  });
  setMatrixPossible(false);
  loadAll();
};

var loadAll = function () {
  loadFromLocal();
  loadSchools();
  loadClasses();
  if (($('ul#people > li').size() === 0) && ($('#groups > ul').size() === 0)) {
    $('#formGroups').hide();
    $('#randomGroupButton').hide();
    $('#groups').hide();
  } else {
    $('#randomGroupButton').show();
    $('#formGroups').show();
    $('#groups').show();
    setMatrixPossible(true);
  }
};

var loadSchools = function () {
  $('select#school').empty();
  $('select#school').append($('<option></option>').attr("value", 71).text("Greve Gymnasium"));
  getSchoolIdsFromLectio();
};

var loadClasses = function () {
  //Todo: save selected school for later use
  $('select#class').empty();
  getClassIdsFromLectio();
};

var clearPeople = function () {
  $('ul#people > li').each(function () {
    this.remove();
  });
  $('#groups > ul').each(function () {
    this.remove();
  });
  saveToLocal();
  localStorage.removeItem('peopleList');
  localStorage.removeItem('groupList');
  setMatrixPossible(false);
  if ($('ul#people > li').length == 0) {
    $('ul#people').hide();
    $('#rndPersonButton').hide();
  }
};

var selectRandomPerson = function () {
  var nameArray = new Array();
  $('ul#people > li').each(function () {
    nameArray.push(this);
  });
  var lot = Math.floor(Math.random()*nameArray.length);
  var name = nameArray[lot].textContent;
  htmlModal ("<ul><li><strong>" + name + "</strong></li></ul>");
};

var selectRandomGroup = function () {
  var groupArray = new Array();
  $('#groups > ul').each(function () {
    groupArray.push(this);
  });
  var lot = Math.floor(Math.random()*groupArray.length);
  var name = "";
  for (var i = 0; i < groupArray[lot].childNodes.length; ++i) {
      if (i > 0) {name += "<br/>";};
      if (i == 1) {name += "<br/>";};
      name += groupArray[lot].childNodes[i].textContent;
      name = name.replace('x <br/><br/>','');
      name = name.replace('<br/>','<br/><br/>');
    };
  htmlModal ("<ul><strong>" + name + "</strong></ul>");
};

var exportList = function () {
  var expoPeople = "";
  var count = 0;
  $('ul#people > li').each(function () {
    if (this.textContent === undefined) {
    } else {
      count++;
      if (count > 1) {
        expoPeople += "\n";
      }
      expoPeople += this.textContent;
    }
  });
  
  var countGroups = 0; 
  var expoGroups = "";
  var g = document.getElementById("groups");
  $('#groups > ul').each(function () {
    countGroups++;
    if (countGroups > 1) {
      expoGroups += "\n";
    }
    
    var thisGroup = this;
    for (var i = 0; i < thisGroup.childNodes.length; ++i) {
      if (i > 0) {expoGroups += "\n";}
      expoGroups += thisGroup.childNodes[i].textContent.replace('[x] ','');     
    }
  });
  
  textModal (expoPeople, expoGroups);
};

var htmlModal = function (htmlToShow) {
  document.getElementById('modal').innerHTML = htmlToShow + '<a class="close-reveal-modal">&#215;</a>';
  
  $('#modal').reveal({ // The item which will be opened with reveal
    animation: 'fade',            // fade, fadeAndPop, none
    animationspeed: 250,          // how fast animtions are
    closeonbackgroundclick: true, // if you click background will modal close?
    dismissmodalclass: 'close-reveal-modal'    // the class of a button or element that will close an open modal
  });
};

var textModal = function (textToShowLeft, textToShowRight) {
  document.getElementById('modal').innerHTML = '<h2>Personer/grupper:</h2><a class="close-reveal-modal">&#215;</a>';
  
  var textBoxLeft = document.createElement('textarea');
  textBoxLeft.readOnly = true;
  textBoxLeft.onfocus = function () {
    textBoxLeft.select();

    // Work around Chrome's little problem
    textBoxLeft.onmouseup = function () {
      // Prevent further mouseup intervention
      textBoxLeft.onmouseup = null;
      return false;
    };
  };
  textBoxLeft.rows = 35;
  textBoxLeft.columns = 100;
  textBoxLeft.value = textToShowLeft;
  document.getElementById('modal').appendChild(textBoxLeft);
  
  var textBoxRight = document.createElement('textarea');
  textBoxRight.readOnly = true;
  textBoxRight.rows = 35;
  textBoxRight.columns = 100;
  textBoxRight.value = textToShowRight;
  document.getElementById('modal').appendChild(textBoxRight);
  
  $('#modal').reveal({ // The item which will be opened with reveal
    animation: 'fade',            // fade, fadeAndPop, none
    animationspeed: 250,          // how fast animtions are
    closeonbackgroundclick: true, // if you click background will modal close?
    dismissmodalclass: 'close-reveal-modal'    // the class of a button or element that will close an open modal
  });
};

var groupsOfN = function (n) {
  //generate groups from the #people list
  var group = [];
  var groupArr = [];
  n = typeof n !== 'undefined' ? n : $('#spinner').spinner( "value" );
  var i = 1;
  $('ul.groupbox > li').each(function () {
    groupArr.push(this);
    this.remove();
  });
  $('ul.groupbox').each(function () {
    if (this.id !== "people") {
      this.remove();
    }
  });
  var peopleArr = $('ul#people > li').toArray();
  peopleArr = peopleArr.concat(groupArr);
  while (peopleArr.length > 0) {
    var rndNum = Math.floor(Math.random()*peopleArr.length);
    var rndPerson = peopleArr.splice(rndNum, 1);
    //put random person in group while there still are people
    if (group[i] === undefined ) {
      group[i] = document.createElement("ul");
      group[i].classList.add("groupBox");
      group[i].classList.add("sortConnecter");
      var t = document.createElement("Section");
      t.classList.add("groupName");
      t.innerHTML = "<span contentEditable=true>" + i + "</span>";
      var d = document.createElement("Section");
      d.classList.add("groupDelete");
      d.innerHTML = "<a title=\"Slet gruppe " + i + "\" class=\"icon-remove-sign\" onClick=\"deleteGroup('" + i + "')\">&nbsp;[x] </a>";
      group[i].title = "Gruppe " + i;
      group[i].setAttribute("id", i);
      group[i].appendChild(d);
      group[i].appendChild(t);
    }
    var li = document.createElement("li");
    li.appendChild(document.createTextNode(rndPerson[0].innerHTML));
    group[i].appendChild(li);
    document.getElementById('groups').appendChild(group[i]);
    if (group[i].children.length - 1> n) {
      i++;
    }
  }
  if ($('ul#people > li').length == 0) {
    ($('ul#people')).hide();
    $('#rndPersonButton').hide();
    
  }
  setMatrixPossible(true);
  setSortables();
  saveToLocal();
}

var nGroups = function (n) {
  var group = [];
  var groupArr = [];
  n = typeof n !== 'undefined' ? n : $('#spinnerN').spinner( "value" );
  var i = 1;
  $('ul.groupbox > li').each(function () {
    groupArr.push(this);
    this.remove();
  });
  $('ul.groupbox').each(function () {
    if (this.id !== "people") {
      this.remove();
    }
  });
  var peopleArr = $('ul#people > li').toArray();
  peopleArr = peopleArr.concat(groupArr);
  var numberOfPeople = peopleArr.length;
  //createthegroups
  var g = 1;
  var m = numberOfPeople % n; //extra people in early groups carried over (modulo)
  while (g <= n) {
    //create group up until we have n groups
    if (group[g] === undefined ) {
      group[g] = document.createElement("ul");
      group[g].classList.add("groupBox");
      group[g].classList.add("sortConnecter");
      var t = document.createElement("Section");
      t.classList.add("groupName");
      t.innerHTML = "<span contentEditable=true>" + g + "</span>";
      var d = document.createElement("Section");
      d.classList.add("groupDelete");
      d.innerHTML = "<a title=\"Slet gruppe " + g + "\" class=\"icon-remove-sign\" onClick=\"deleteGroup('" + g + "')\">&nbsp;x </a>";
      group[g].title = "Group " + g;
      group[g].setAttribute("id", g);
      group[g].appendChild(d);
      group[g].appendChild(t);
      document.getElementById('groups').appendChild(group[g]);
    }
    var l = 0;
    var extra = 0; //(an extra person in this group?)
    if (m > 0) {extra = 1;}
    while((l < (Math.floor(numberOfPeople / n) + extra)) && (peopleArr.length > 0)) {
      //add people to the group
      var rndNum = Math.floor(Math.random()*peopleArr.length);
      var rndPerson = peopleArr.splice(rndNum, 1);
      var li = document.createElement("li");
      li.appendChild(document.createTextNode(rndPerson[0].innerHTML));
      group[g].appendChild(li);
      l = group[g].children.length - 2;
      if (l > Math.floor(numberOfPeople / n)) {
        m--;
        if (m <= 0) {
          extra = 0;
        }
      }
    }
    g++;
  }
  if ($('ul#people > li').length == 0) {
    //hide irrelevant UI elements for ease of use
    ($('ul#people')).hide();
    $('#rndPersonButton').hide();
  }
  setMatrixPossible(true);
  setSortables();
  saveToLocal();
}

var setMatrixPossible = function(b){
	$('#matrixGroups').hide();
	$("input[name='matrixCheckBox']").prop('checked', false);
	if (b) {
    $("input[name='matrixCheckBox']").removeAttr("disabled");
  } else {
    $("input[name='matrixCheckBox']").attr("disabled", true);
  }
}

var matrixGroups = function() {
	if ($("input[name='matrixCheckBox']").is(':checked')) {
		$('#groups').hide();
		$('#formGroups').hide();
		document.getElementById('matrixGroups').innerHTML = "";
		var groupArray = new Array();
	  $('#groups > ul').each(function () {
	    groupArray.push(this);
	  });

	  var matrix = [];
		var t = document.createElement("table");
		t.classList.add("matrixTable");
	  for (var g = groupArray.length - 1; g >= 0; g--) {
		  var r = t.insertRow(0); 
		  r.classList.add("matrixRow");
		  for (var i = 0; i < groupArray[g].childNodes.length; ++i) {
		  	var chi = groupArray[g].childNodes[i];
		  	if ($(chi).is("li")) {
		  		var c = r.insertCell(0);
		  		c.classList.add("matrixCell");
		  		c.innerHTML = chi.innerHTML;
		  	}
			}
		  var c = r.insertCell(0);
		  c.classList.add("matrixHeaderCell");
		  c.innerHTML = "" + (g + 1);		  
	  }
	  
	  var r = t.insertRow(0); 
	  r.classList.add("matrixRow");
	  var c = r.insertCell(0);
	  c.classList.add("matrixHeaderCell");
	  c.innerHTML = "&nbsp;";
	  var matrixGroupNames = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
	  for (var m = groupArray[0].childNodes.length - 3; m >= 0; m--) {
	  	var c = r.insertCell(1);
	  	c.classList.add("matrixHeaderCell");
	  	c.innerHTML = "" + matrixGroupNames[m];
		}
    document.getElementById('matrixGroups').appendChild(t);
		$('#matrixGroups').show();
	} else {
		$('#groups').show();
		$('#formGroups').show();
		$('#matrixGroups').hide();
	}
}

var deleteGroup = function (id){
  $("ul.groupBox").each(function (i) {
    if ($(this)[0].id == id) {
      if (confirm("Slet gruppe " + i + "?")) {
        $(this).hide(250, function () {
          $(this).find("li").each(function (h) {
            addPerson(this.innerHTML, false)
          });
          $(this).remove();
        });
      }
    }
  });
}

var setSortables = function () {
  var ul = document.getElementById("people");
  ul.classList.add("groupBox");
  ul.classList.add("sortConnecter");
  $(".sortConnecter").sortable({
    placeholder: "placeholder",
    connectWith: ".sortConnecter",
    update: function () {
      saveToLocal();
    },
    items: "> li",
    revert: true
  });
}

var saveToLocal = function () {
  //save everything to local storage
  if (!supportsLocalStorage()) { return false; }
  
  var ul = document.getElementById("people");
  if ($('ul#people').size() > 0) {
    localStorage.setItem('peopleList', ul.innerHTML);
  } else {
    localStorage.removeItem('peopleList');
  }

  var g = document.getElementById("groups");
  if ($('#groups > ul').size() > 0) {
    localStorage.setItem('groupList', g.innerHTML);
  } else {
    localStorage.removeItem('groupList');
  }
  return true;
}

var loadFromLocal = function () {
  if (!supportsLocalStorage()) { return false; }
  if (localStorage.getItem('peopleList')) {
    var ul = document.getElementById("people");
    ul.innerHTML = localStorage.getItem('peopleList');
  }
  if (localStorage.getItem('groupList')) {
    var g = document.getElementById("groups");
    g.innerHTML = localStorage.getItem('groupList');
    setMatrixPossible(true);
  }
  setSortables();
  if ($('ul#people > li').length == 0) {
    ($('ul#people')).hide();
    $('#rndPersonButton').hide();
    
  }
  return true;
}

function supportsLocalStorage() {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    return false;
  }
}

$("#addPersonText").keyup(function (e) {
  if (e.keyCode == 13) { //ENTER
    addPerson($('input[id=addPersonText]').val(), true);
    $('input[id=addPersonText]').val("");
    saveToLocal();
  }
});

$("#addGroupText").keyup(function (e) {
  if (e.keyCode == 13) { //ENTER
    addGroup($('input[id=addGroupText]').val(), true);
    $('input[id=addGroupText]').val("");
    saveToLocal();
    setMatrixPossible(true);
  }
});

$("#spinner").keyup(function (e) {
  if (e.keyCode == 13) { //ENTER
    groupsOfN();
  }
});
$("#spinnerN").keyup(function (e) {
  if (e.keyCode == 13) { //ENTER
    nGroups();
  }
});

var nVal;
$("body").keyup(function (e) {
  /*
  if ((e.keyCode == 37) || (e.keyCode == 39)) { //LEFT, RIGHT

  } else if (e.keyCode == 38) { //UP
    nVal = $("#spinner").spinner("value") + 1;
    $("#spinner").spinner( "value", nVal);
    groupsOfN();
  } else if (e.keyCode == 40) { //DOWN
    nVal = $("#spinner").spinner("value") - 1;
    $("#spinner").spinner( "value", nVal);
    groupsOfN();
  }
  */
});

var addPerson = function (name, fade) {
  fade = typeof fade !== 'undefined' ? fade : 'false';
  var ul = document.getElementById("people");
  var li = document.createElement("li");
  $('#groupBox').show();
  li.appendChild(document.createTextNode(name));
  ul.appendChild(li);
  if (fade) {
    var s = $("#people > li").size();
    li.classList.add("showing" + s);
    $(".showing" + s).hide();
    $(".showing" + s).show("scale", { percent: 100 }, 500);
    li.classList.remove( "showing" + s);
  }
  $('ul#people').show();
  $('#rndPersonButton').show();
  $('#randomGroupButton').show();
  $('#formGroups').show();
  $('#groups').show();
  setSortables();
  saveToLocal();
}

var addGroup = function (name, fade) {
  fade = typeof fade !== 'undefined' ? fade : 'false';
  var ul = document.createElement("ul");
  ul.classList.add("groupBox");
  ul.classList.add("sortConnecter");
  var t = document.createElement("Section");
  t.classList.add("groupName");
  t.innerHTML = "<span contentEditable=true>" + name + "</span>";
  var d = document.createElement("Section");
  d.classList.add("groupDelete");
  d.innerHTML = "<a title=\"Slet gruppe ' + name + '\" class=\"icon-remove-sign\" onClick=\"deleteGroup('" + name + "')\">&nbsp;x </a>";
  ul.title = "Group " + name;
  ul.setAttribute("id", name);
  ul.appendChild(d);
  ul.appendChild(t);
  document.getElementById('groups').appendChild(ul);
  if (fade) {
    /*  
      var s = $("#people > li").size();
      li.classList.add("showing" + s);
      $(".showing" + s).hide();
      $(".showing" + s).show("scale", { percent: 100 }, 500);
      li.classList.remove( "showing" + s);
    */
  }
  $('ul#groups').show();
  setMatrixPossible(true);
  setSortables();
  saveToLocal();
}


$(document).keyup(function (e){
  if (e.keyCode == 46) { //|| (e.keyCode == 8)) { //DEL key
    $('people li[id=ui-selected]').remove();
    $( ".ui-selected", this ).each(function () {
      this.remove();
    });
    saveToLocal();
  }
});

function htmlEncode(value){
  //create an in-memory div, set it's inner text(which jQuery automatically encodes)
  //then grab the encoded contents back out.  The div never exists on the page.
  return $('<div/>').text(value).html();
}

function htmlDecode(value){
  //create an in-memory div, set it's inner text(which jQuery automatically encodes)
  //then grab the encoded contents back out.  The div never exists on the page.
  return $('<div/>').html(value).text();
}

function removeHTMLTags(htmlString){
  if(htmlString){
    var mydiv = document.createElement("div");
    mydiv.innerHTML = htmlString;

    if (document.all) // IE Stuff
    {
      return mydiv.innerText;
        
    }   
    else // Mozilla does not work with innerText
    {
      return mydiv.textContent;
    }                           
  }
}