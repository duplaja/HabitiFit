$(document).ready(function() {

   //Data we need:
   //Fitbit Implicit Grant data: (scope, user_id, token_type, auth_token)
   //Habitica Api data (user_id, api_token, task_name)
   //
   //TO ADD:  Check to see if Fitbit auth token has expired to present a new auth form!
   //TO ADD: error handling!

   //If window has hash, it means we've got some FitBit api data to crunch!
   if(window.location.hash){
        url = window.location.hash.substr(1).split('&');
        re = /=.*/;
        var data = [];
        url.forEach(function(item){
           data.push(re.exec(item).toString().substr(1));
        });

       //Get authentication data
       localStorage.scope = data[2];
       localStorage.user_id= data[1];
       localStorage.token_type = data[3];
       localStorage.auth_token = data[0];

   }
    //check to see if we have fitbit auth data before we execute
   if(localStorage.scope && localStorage.user_id && localStorage.token_type && localStorage.auth_token){
       //Set activity variables
       if(!(localStorage.steps_taken && localStorage.calories_burned && localStorage.miles_walked && localStorage.lightly_active && localStorage.fairly_active && localStorage.very_active)){
           localStorage.steps_taken = 0;
           localStorage.calories_burned = 0;
           localStorage.miles_walked = 0;
           localStorage.lightly_active = 0;
           localStorage.fairly_active = 0;
           localStorage.very_active = 0;
       }

       //try to get data
       get_data();

       //setup habit tracking variables
       if(!localStorage.track){
           track = {cal: 0, mile: 0, step: 0, lightly_active: 0, fairly_active: 0, very_active: 0};
           localStorage.track = JSON.stringify(track);
       }
       if(!localStorage.track_bool){
           track = {cal: false, mile: false, step: false, lightly_active: false, fairly_active: false, very_active: false};
           localStorage.track_bool= JSON.stringify(track);
       }


       $('#get-data').click(function(){
           //ga('send', 'pageview', '/manual-refresh');
           get_data();
           location.reload();
       });

       $('#logout').click(function(){
           r = confirm("Are you sure you want to reset? You shouldn't log in again until next cron");
            if (r == true) {
                localStorage.clear();
            }
       });

        $("#habitica_info_submit").click(function( event ) {
          if($('#user_id').val() && $('#api_token').val()){
              localStorage.hab_user_id  = $('#user_id').val();
              localStorage.hab_api_tok = $('#api_token').val();

              hab_params = {user_id: localStorage.hab_user_id, api_tok: localStorage.hab_api_tok};
              localStorage.hab_stats = habitica_do(hab_params,"get_stats");
              user_stats = JSON.parse(localStorage.hab_stats);

              console.log(user_stats);

              if(user_stats.error){
                  $('#hab_output').html(user_stats.error);
                  $('#hab_output').fadeIn();
                  $('#hab_output').fadeOut(5000);
              }else{
                  update_habitica_html(user_stats);

                  $('#hab_output').html('api info updated');
                  $('#hab_output').fadeIn();
                  $('#hab_output').fadeOut(5000);

              }
          }else{
              $('#hab_output').html('please fill out both fields!');
              $('#hab_output').fadeIn();
              $('#hab_output').fadeOut(5000);
          }

          event.preventDefault();
        });


       //if tasks update is updated
       $("#update_submit").click(function(event){
          track = JSON.parse(localStorage.track);
          track_bool = JSON.parse(localStorage.track_bool);

          //double check times updated values
           times_up = JSON.parse(localStorage.times_updated);
           old_values = [track.cal, track.mile, track.step, track.lightly_active, track.fairly_active, track.very_active];

          track.cal, track.mile, track.step, track.lightly_active, track.fairly_active, track.very_active = 0;
          track_bool.cal, track_bool.mile,track_bool.step, track.lightly_active, track.fairly_active, track.very_active = false

          if($("#track_calories").is(':checked') && isInt($("#calories_value").val())){
             track.cal =  $("#calories_value").val();
             track_bool.cal = true;
              times_up.cal = Math.floor((times_up.cal * old_values[0])/track.cal);
          }

          if($("#track_steps").is(':checked') && isInt($("#steps_value").val()) ){
              track.step = $("#steps_value").val();
              track_bool.step = true;
              times_up.step = Math.floor((times_up.step * old_values[2])/track.step);
          }

          if($("#track_miles").is(':checked') && isInt($("#miles_value").val())){
              track.mile = $("#miles_value").val();
              track_bool.mile = true;
              times_up.mile = Math.floor((times_up.mile * old_values[1])/track.mile);
          }

          if($("#track_lightly_active").is(':checked') && isInt($("#lightly_active_value").val())){
              track.lightly_active = $("#lightly_active_value").val();
              track_bool.lightly_active = true;
              times_up.lightly_active = Math.floor((times_up.lightly_active * old_values[1])/track.lightly_active);
          }

          if($("#track_fairly_active").is(':checked') && isInt($("#fairly_active_value").val())){
              track.fairly_active = $("#fairly_active_value").val();
              track_bool.fairly_active = true;
              times_up.fairly_active = Math.floor((times_up.fairly_active * old_values[1])/track.fairly_active);
          }

          if($("#track_very_active").is(':checked') && isInt($("#very_active_value").val())){
              track.very_active = $("#very_active_value").val();
              track_bool.very_active = true;
              times_up.very_active = Math.floor((times_up.very_active * old_values[1])/track.very_active);
          }

           localStorage.track = JSON.stringify(track);
           localStorage.track_bool = JSON.stringify(track_bool);
           localStorage.times_updated = JSON.stringify(times_up);

           $('#up_output').html('fields updated');
           $('#up_output').fadeIn();
           $('#up_output').fadeOut(5000);

           reset_checkboxes();

           event.preventDefault();
       });

       reset_checkboxes();

       if(localStorage.hab_stats && !JSON.parse(localStorage.hab_stats).error){
           update_habitica_html(JSON.parse(localStorage.hab_stats));
       }

       //initialize some variables it they aren't already
       if(!localStorage.times_updated){
           localStorage.times_updated = JSON.stringify({cal: 0, mile: 0, step: 0});
       }

       if(!localStorage.today_date){
            localStorage.today_date = get_today_date();
       }

       localStorage.fetch_date = get_today_date();

       if(new Date(localStorage.fetch_date).getTime() > new Date(localStorage.today_date).getTime()){
           localStorage.today_date = localStorage.fetch_date;
           console.log("It's a new day!");
           //reset counters
           localStorage.times_updated = JSON.stringify({cal: 0, mile: 0, step: 0});
       }

       window.setInterval(function(){
           //reload the page instead of just refreshing it, so that users can use the most updated version of the app
           //ga('send', 'pageview', '/auto-refresh');
           get_data();
           location.reload(true);

        }, 180000)

   }else{
       $("#main_view").css("display","none");
   }

    function get_data(){
       $.ajax({
        url:'data.php',
        dataType: 'json',
        data: {token_type : localStorage.token_type, access_token : localStorage.auth_token, user_id : localStorage.user_id, date: localStorage.today_date},
        async: false,
        success: function(data){
            //make sure there are no errors
            if(data.errors && data.errors[0]){
                //since we're using implicit grant authorization flow, we cannot refresh the token.  User must reauthenticate.
                 $("#auth_error").css("display","block");
                 $("#main_view").css("display","none");
            }else{
                localStorage.steps_taken = data.summary.steps;
                localStorage.calories_burned = data.summary.caloriesOut;
                localStorage.lightly_active = data.summary.lightlyActiveMinutes;
                localStorage.fairly_active = data.summary.fairlyActiveMinutes;
                localStorage.very_active = data.summary.veryActiveMinutes;

                data.summary.distances.forEach(function(item){
                    if(item.activity == "total"){
                        localStorage.miles_walked = item.distance;
                    }
                });

                times_up = JSON.parse(localStorage.times_updated);
                track = JSON.parse(localStorage.track);
                track_bool = JSON.parse(localStorage.track_bool);

                $.each(track_bool, function(k, v) {
                    //check date every time this function is called
                    localStorage.fetch_date = get_today_date();

                   if(new Date(localStorage.fetch_date).getTime() > new Date(localStorage.today_date).getTime()){
                       localStorage.today_date = localStorage.fetch_date;
                       console.log("It's a new day!");
                       //reset counters
                       localStorage.times_updated = JSON.stringify({cal: 0, mile: 0, step: 0});
                   }


                    if(v){
                        upper = 0;
                        lower = parseInt(track[k]);
                        track_name = "";

                        if(k=='cal'){
                            upper = parseInt(localStorage.calories_burned);
                            track_name = lower + " calories burned";
                        }else if(k == 'step'){
                            upper = parseInt(localStorage.steps_taken);
                            track_name = lower + " steps taken";
                        }else if(k == 'mile'){
                            upper = parseInt(localStorage.miles_walked);
                            track_name = lower + " miles traveled";
                        }else if(k == 'lightly_active'){
                            upper = parseInt(localStorage.lightly_active);
                            track_name = lower + " lightly active minutes";
                        }else if(k == 'fairly_active'){
                            upper = parseInt(localStorage.fairly_active);
                            track_name = lower + " fairly active minutes";
                        }else if(k == 'very_active'){
                            upper = parseInt(localStorage.very_active);
                            track_name = lower + " very active minutes";
                        }

                        times = Math.floor(upper/lower);
                        if(times > times_up[k]){
                            if(localStorage.hab_user_id && localStorage.hab_api_tok){
                                diff = times - times_up[k];
                                console.log(times);
                                for(i = 0; i< diff; i++){
                                    hab_params = {task_name: track_name, direction: 'up', user_id: localStorage.hab_user_id, api_tok: localStorage.hab_api_tok};
                                     if(habitica_do(hab_params, "change_habit")){
                                         change = JSON.parse(localStorage.times_updated);
                                         change[k] = times;
                                         localStorage.times_updated = JSON.stringify(change);
                                     }else{
                                        $('#hab_output').html('No task found with that name!');
                                        $('#hab_output').fadeIn();
                                        $('#hab_output').fadeOut(4000);
                                     }
                                }
                                //update habitica user data
                                hab_params = {user_id: localStorage.hab_user_id, api_tok: localStorage.hab_api_tok};
                                localStorage.hab_stats = habitica_do(hab_params,"get_stats");
                                update_habitica_html(JSON.parse(localStorage.hab_stats));
                            }else{
                                $('#hab_output').html('please add habitica info');
                                $('#hab_output').fadeIn();
                                $('#hab_output').fadeOut(4000);
                            }
                        }
                    }
                });

                //update fitbit user data
                $('#steps').html(localStorage.steps_taken);
                $('#calories').html(localStorage.calories_burned);
                $('#miles').html(localStorage.miles_walked);
                $('#lightly_active').html(localStorage.lightly_active);
                $('#fairly_active').html(localStorage.fairly_active);
                $('#very_active').html(localStorage.very_active);
            }
        }
       });
   }

    //
    // Updates habitica habit
    // Object params depends on type of action. Currently two actions supported: "change_habit" | "get_stats"
    // change_habit required variables: task_name (string), direction ('up' | 'down'), user_id (string), api_tok (string)
    // get_stats required variables: user_id (string), api_tok (string)
    //

    function habitica_do(params, action){
       return_val = false;
       $.ajax({
        url:'habit_data.php',
        data:{data_params: params, action: action},
        async: false,
        success: function(data){
            if(data == 'ERROR'){
               return_val = false;
            }else{
                return_val = data;
            }
            $('#user_id').val('');
            $('#api_token').val('');

        }
       });

       return return_val;
    }


    //keep checkboxs updated on page refresh
   //really clunky down here
   function reset_checkboxes(){
       if(JSON.parse(localStorage.track_bool)){
           track = JSON.parse(localStorage.track_bool);
               $("#track_calories").prop("checked",track.cal);
               $("#track_steps").prop("checked",track.step);
               $("#track_miles").prop("checked",track.mile);
               $("#track_lightly_active").prop("checked",track.lightly_active);
               $("#track_fairly_active").prop("checked",track.fairly_active);
               $("#track_very_active").prop("checked",track.very_active);
       }
       if(JSON.parse(localStorage.track)){
           track = JSON.parse(localStorage.track);
               $("#calories_value").val((track.cal) ? track.cal : "");
               $("#steps_value").val((track.step) ? track.step : "");
               $("#miles_value").val((track.mile) ? track.mile : "");
               $("#lightly_active_value").val((track.lightly_active) ? track.lightly_active : "");
               $("#fairly_active_value").val((track.fairly_active) ? track.fairly_active : "");
               $("#very_active_value").val((track.very_active) ? track.very_active : "");
       }
   }

    //
    // Updates html fields for habitica data
    //

    function update_habitica_html(user_stats){
        $('#hab_name').html(user_stats.habitRPGData.data.profile.name);
        $('#hab_class').html(user_stats.habitRPGData.data.stats.class);
        $('#hab_level').html(user_stats.habitRPGData.data.stats.lvl);

        $('#hab_name').fadeIn();
        $('#hab_class').fadeIn();
        $('#hab_level').fadeIn();

          $('#hab_xp_bar').css("width",(user_stats.habitRPGData.data.stats.exp/user_stats.habitRPGData.data.stats.toNextLevel)*100 + "%");
        $('#hab_xp_prog').html(user_stats.habitRPGData.data.stats.exp + "/" + user_stats.habitRPGData.data.stats.toNextLevel);
    }

    //
    // Gets today's date in the form of yyyy/mm/dd
    //
    function get_today_date(){
       var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();

        if(dd<10) {
            dd='0'+dd
        }

        if(mm<10) {
            mm='0'+mm
        }

        today = yyyy+'-'+mm+'-'+dd
        return today;
    }

    function isInt(n) {
       return n % 1 === 0;
    }
});
