<html>
  <head>
    <meta name="title" content="Grouper" />
    <LINK REL=StyleSheet HREF="style.css" TYPE="text/css" MEDIA=all>
  </head>
  
  <body onload="loadAll()">
    
    <title>Grouper</title>
      
      <div id="peopleBox">
        <div id="import">
          <button onclick='importClassFromLectio(event)'>Importér klasse: </button>
          <select id="school" name="school" onchange="loadClasses()"> </select>
          <select id="class" name="Class"> </select>
        </div>
        <input type="text" id="addPersonText" name="addPerson" autofocus="autofocus" placeholder="Tilføj person"><br />
        <ul id="people">
        </ul>
        <button id="rndPersonButton" onclick='selectRandomPerson()'>Vælg tilfældig person</button>
        
      </div>
      
      <hr>


      <div id="groupBox">
        <div id="formGroups">
          <button onclick='groupsOfN()'>Lav grupper á </button> <input id="spinner" name="value" value="3" /> <!--<label><input type="checkbox" name="matrix" value="matrix" disabled><del>in matrix</del></label>-->
          <br /><button onclick='nGroups()'>Lav <i>n</i> grupper </button> <input id="spinnerN" name="n" value="3" />
          <input type="text" id="addGroupText" name="addGroup" autofocus="autofocus" placeholder="Tilføj gruppe">
        </div>
        <div id="groups">
        </div>
        <button onclick='clearPeople()'>Ryd alt</button>
        <button onclick='exportList()'>Eksportér</button>
        <button id='randomGroupButton' onclick='selectRandomGroup()'>Vælg tilfældig gruppe</button>
        
      </div>
    
    <div id="modal" class="reveal-modal">
    </div>
    
    <footer id="footer">This work is licensed by <a href=http://tobias.bindslet.dk>Tobias Bindslet</a> under a <a href=http://creativecommons.org/licenses/by-nc/3.0/>Creative Commons License for attributed, non-commercial use</a>.</footer>
    
  
    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
    <script src="//code.jquery.com/ui/1.10.3/jquery-ui.js"></script>
    <script src="jquery.reveal.js"></script>
    <script src="jquery.ui.touch-punch.min"></script>
    
    <script>
    
    var init = function() {
        setSortables();
        $( "#spinner" ).spinner({
          spin: function( event, ui ) {
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
        $( "#spinnerN" ).spinner({
          spin: function( event, ui ) {
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
      };
    
      var loadAll = function() {
        loadFromLocal();
        loadSchools();
        loadClasses();
        if (($('ul#people > li').size() == 0) && ($('#groups > ul').size() == 0)) {
          $('#formGroups').hide();
          $('#randomGroupButton').hide();
          $('#groups').hide();
        } else {
          $('#randomGroupButton').show();
          $('#formGroups').show();
          $('#groups').show();
        }
      };
      
      var loadSchools = function() {
        $('select#school').empty();
        $('select#school').append($('<option></option>').attr("value", 71).text("Greve Gymnasium"));
        getSchoolIdsFromLectio();
      };
      
      var loadClasses = function() {
        //Todo: save selected school for later use
        $('select#class').empty();
        getClassIdsFromLectio();
      };
    
      var clearPeople = function() {
        $('ul#people > li').each(function() {
          this.remove();
        });
        $('#groups > ul').each(function() {
          this.remove();
        });
        saveToLocal();
        localStorage.removeItem('peopleList');
        localStorage.removeItem('groupList');
        if ($('ul#people > li').length == 0) {
          $('ul#people').hide();
          $('#rndPersonButton').hide();
        }
      };
      
      var selectRandomPerson = function() {
        var nameArray = new Array();
        $('ul#people > li').each(function() {
          nameArray.push(this);
        });
        var lot = Math.floor(Math.random()*nameArray.length);
        var name = nameArray[lot].textContent;
        htmlModal ("<ul><li><strong>" + name + "</strong></li></ul>");
      }
      
      var selectRandomGroup = function() {
        var groupArray = new Array();
        $('#groups > ul').each(function() {
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
      }
      
      var exportList = function() {
        var expoPeople = "";
        var count = 0;
        $('ul#people > li').each(function() {
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
        $('#groups > ul').each(function() {
          countGroups++;
          if (countGroups > 1) {
            expoGroups += "\n\n";
          }
          
          var thisGroup = this;
          for (var i = 0; i < thisGroup.childNodes.length; ++i) {
            if (i > 0) {expoGroups += "\n";};
            expoGroups += thisGroup.childNodes[i].textContent.replace('x ','');;
            
          };
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
      }
      
      var textModal = function (textToShowLeft, textToShowRight) {
        document.getElementById('modal').innerHTML = '<h2>Personer/grupper:</h2><a class="close-reveal-modal">&#215;</a>';
        
        var textBoxLeft = document.createElement('textarea');
        textBoxLeft.readOnly = true;
        textBoxLeft.onfocus = function() {
          textBoxLeft.select();
    
          // Work around Chrome's little problem
          textBoxLeft.onmouseup = function() {
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
      }
      
      var groupsOfN = function(n) {
        //generate groups from the #people list
        var group = [];
        var groupArr = [];
        n = typeof n !== 'undefined' ? n : $('#spinner').spinner( "value" );
        var i = 1;
        $('ul.groupbox > li').each(function() {
          groupArr.push(this);
          this.remove();
        });
        $('ul.groupbox').each(function() {
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
            d.innerHTML = "<a title=\"Slet gruppe " + i + "\" class=\"icon-remove-sign\" onClick=\"deleteGroup('" + i + "')\">&nbsp;x </a>";
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
        setSortables();
        saveToLocal();
      }
      
      var nGroups = function(n) {
        var group = [];
        var groupArr = [];
        n = typeof n !== 'undefined' ? n : $('#spinnerN').spinner( "value" );
        var i = 1;
        $('ul.groupbox > li').each(function() {
          groupArr.push(this);
          this.remove();
        });
        $('ul.groupbox').each(function() {
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
        setSortables();
        saveToLocal();
      }
      
      var deleteGroup = function(id){
        $("ul.groupBox").each(function(i) {
          if ($(this)[0].id == id) {
            if (confirm("Slet gruppe " + i + "?")) {
              $(this).hide(250, function() {
                $(this).find("li").each(function(h) {
                  addPerson(this.innerHTML, false)
                });
                $(this).remove();
              });
            }
          }
        });
      }
      
      var setSortables = function() {
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
      
      var saveToLocal = function() {
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
      
      var loadFromLocal = function() {
        if (!supportsLocalStorage()) { return false; }
        if (localStorage.getItem('peopleList')) {
          var ul = document.getElementById("people");
          ul.innerHTML = localStorage.getItem('peopleList');
        }
        if (localStorage.getItem('groupList')) {
          var g = document.getElementById("groups");
          g.innerHTML = localStorage.getItem('groupList');
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
      
      var addPerson = function(name, fade) {
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
      
      var addGroup = function(name, fade) {
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
        setSortables();
        saveToLocal();
      }
      
      
      $(document).keyup(function(e){
        if (e.keyCode == 46) { //|| (e.keyCode == 8)) { //DEL key
          $('people li[id=ui-selected]').remove();
          $( ".ui-selected", this ).each(function() {
            this.remove();
          });
          saveToLocal();
        }
      });
      
      function htmlEncode(value){
        //create a in-memory div, set it's inner text(which jQuery automatically encodes)
        //then grab the encoded contents back out.  The div never exists on the page.
        return $('<div/>').text(value).html();
      }
      
      function htmlDecode(value){
        //create a in-memory div, set it's inner text(which jQuery automatically encodes)
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
      
      var baseUrl = "http://twobias.synology.me/proxy/proxy.php?url=http%3A%2F%2Fwww.lectio.dk%2Flectio%2F";
      var scrapeUrl;
      var schoolUrl;
      
      var getSchoolIdsFromLectio = function () {
        var schoolsUrl = "login_list.aspx";
        scrapeUrl = baseUrl + schoolsUrl; 
        scrapeSchoolIdsFromLectio(scrapeUrl);
      };
      
      var scrapeSchoolIdsFromLectio = function (sourceUrl) {  
        $.ajax({
          url: sourceUrl,
          type: "get",
          dataType: "html",
          success: function(data) {
            //extract school names and IDs from buttons on webpage
            var links = data.split('<div class=\\"buttonHeader textLeft \\"><a href=\'');
            for (var n = 1; n < links.length; n++) {
              var src;
              var linkText;
              //if (links[n].search("'>") != -1) {
                linkText = links[n].substring(links[n].search("'>") + 2);
                linkText = linkText.substring(0, linkText.search('<'));
                linkText = htmlDecode(linkText);
                //console.log(linkText);
                src = links[n].substring(links[n].search("/lectio/") + 11);
                src = src.substring(0, src.search('\\\\'));
                //console.log(src);
                $('select#school').append($('<option></option>').attr("value", src).text(linkText));
              //}
            }
            loadClasses()
          },
          error: function(status) {
            console.log("request error:" + sourceUrl + status.textError);
          }
        });
      };
      
      var getClassIdsFromLectio = function () {
        schoolUrl = $("select#school").val() + "%2F";
        var classesUrl = "FindSkema.aspx?type=stamklasse";
        scrapeUrl = baseUrl + schoolUrl + classesUrl; 
        scrapeClassIdsFromLectio(scrapeUrl);
        //console.log(scrapeUrl);
      };
      
      var scrapeClassIdsFromLectio = function (sourceUrl) {  
        $.ajax({
          url: sourceUrl,
          type: "get",
          dataType: "html",
          success: function(data) {
            //extract class names and class IDs from table
            var links = data.split("<a  ");
            for (var n = 1; n < links.length; n++) {
              var src = links[n].substring(links[n].search("href='"));
              if (links[n].search("klasseid=") != -1) {
                src = links[n].substring(links[n].search("klasseid=") + 9);
                src = src.substring(0, src.search("'>"));
                var linkText = links[n].substring(links[n].search("'>") + 2);
                linkText = linkText.substring(0, linkText.search("<\\\\/a"));
                $('select#class').append($('<option></option>').attr("value", src).text(linkText));
              }
            }          
          },
          error: function(status) {
            console.log("request error:" + sourceUrl + status.textError);
          }
        });
      };
      
      var importClassFromLectio = function (event) {
        event.preventDefault();
        clearPeople();
        schoolUrl = $("#school").val() + "%2F";
        var classId = $("#class").val();
        var classUrl = "subnav%2Fmembers.aspx%3Fklasseid%3D" + classId + "%26showstudents%3D1&mode=native";
        scrapeUrl = baseUrl + schoolUrl + classUrl;
        scrapeClassFromLectio(scrapeUrl);
      };
      
      var scrapeClassFromLectio = function (sourceUrl) {  
        var html;
        $.ajax({
          url: sourceUrl,
          type: "get",
          dataType: "html",
          success: function(data) {
            //extract names from table
            var studentName = [];
            for (var i=1; i<40; i++)
            { 
              var iText = i;
              if (i <= 9) {
                iText = "0" + i;
              }
              if (data.search(" " + iText + '</span></td>') != -1) {//if student exists
              //console.log(iText);
                studentName[i] = data.substring(data.search(' ' + iText + '</span></td>') + 3);
                studentName[i] = studentName[i].substring(0, studentName[i].search('</span></td><td class="nowrap"><span'));
                studentName[i] = studentName[i].replace(/(<([^>]+)>)/ig,""); //remove all html <tags>
                //console.log(studentName[i]);
                studentName[i] = htmlDecode(studentName[i]); //decode html-chars such as &aring;
                studentName[i] = studentName[i].replace(/\r?\n|\r/g," "); //replace newlines with spaces
                studentName[i] = studentName[i].replace(/[ \t\r]+/g," "); //remove extra whitespace, tabs etc
                //change middle names to initials
                var names = studentName[i].split(" ");
                names.shift(); //remove first empty space name
                var midNames = 0;
                for (var n = 1; n < names.length - 1; n++) {
                  names[n] = names[n].charAt(0);
                  midNames = n;
                }
                studentName[i] = names[0]; 
                for (var m = 0; m < midNames; m++) {
                  studentName[i] += " " + names[m+1] + ".";
                }
                studentName[i] += " " + names[m+1];
                addPerson(studentName[i], false);
              }
            }
            saveToLocal();
          },
          error: function(status) {
            console.log("request error:" + sourceUrl + status.textError);
          }
        });
      };
      
      init();
      
    </script>
  
  </body>
  
  <!-- also see: http://www.windowsillsoft.com/GroupCreator/-->
</html>