<!DOCTYPE html>
<html>
    <head>
        <title>HabitiFit-3.0</title>
       <script src="js/jquery-2.1.4.min.js"></script>
       <script src="js/bootstrap.min.js"></script>
        <script src="js/index.js"></script>
       <link rel="stylesheet" href="css/bootstrap.min.css" type="text/css" />
       <link rel="stylesheet" href="css/style.css" type="text/css" />

    </head>

    <body>

        <nav class="navbar navbar-inverse navbar-static-top">
          <div class="container-fluid">
            <div class="navbar-header">
              <h1 class="navbar-brand">HabitiFit</h1>
            </div>
          </div>
        </nav>

      <div class="container">

         <div class="row">
              <h2>How to Use:</h2>

              <ol>
                 <li class="med-font"> Authenticate with Fitbit, then fill in your habitica api data (press submit)!</li>
                 <li class="med-font">  Pick the metrics you'd like to use and fill in their values.  Press submit.  </li>
                 <li class="med-font">Go into habitica and create a habit with a name identical to the field you filled out. Repeat for multiple metrics</li>
                 <li class="med-font"> That's it! Every three or so minutes, the page will automatically poll Fitbit's api and update your habitica profile according to your metrics!</li>
             </ol>
             <p>This app is run entirely client-side. That means that no data is stored anywhere outside your local machine, and this page must remain open for your totals to be actively updated.
                 If you would like a more continuous experience, check out our server-side integration: setup once, works without checking in!</p>
             <hr>
          </div>

          <br>
          <div class="row">
                  <a href="https://www.fitbit.com/oauth2/authorize?response_type=token&client_id=22DF3D&scope=activity&expires_in=2592000&prompt=none" class="btn btn-primary center-block">Authenticate with Fitbit</a>
                <br>
                <h3 class="text-center">Please report bugs or feature requests <a href="https://github.com/duplaja/HabitiFit/issues" target="_blank">here!</a></h3>
                <br>
                <div class="alert alert-danger alert-dismissible" style="display:none;" id="auth_error" role="alert">
                  <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                      Your Fitbit access code has expired.  Please re-authenticate.  Note: This is not a valid logout
                </div>
                <hr>
          </div>
      </div>

       <div class="container" id="main_view">
             <div class="row">
              <div class="col-md-4 fitbit-color text-center">
              <img src="img/fitbit_logo.png" style="max-width:150px;" class="center-block" >
              <br>
               <a class="btn btn-default" id="get-data">Refresh Fitbit Data</a><br>
                <br>
                <h4>Steps Today: <span id="steps"></span></h4>
                 <h4>Calories Out Today: <span id="calories"></span></h4>
                  <h4>Miles Walked Today: <span id="miles"></span></h4>
                  <h4>Lightly Active Minutes Today: <span id="lightly_active"></span></h4>
                  <h4>Fairly Active Minutes Today: <span id="fairly_active"></span></h4>
                  <h4>Very Active Minutes Today: <span id="very_active"></span></h4>
                  <br>
                  <a href="/" class="btn btn-danger" id="logout">Reset All Data (logout)</a><br>
              </div>

              <div class="col-md-4 center-block">
                   <div class="form-group">
                      <h4 class="control-label">Pick Whichever Metrics You'd Like to Track!</h4>
                      <h5>You'll need to have a habit whose text is the same as the input form.</h5>
                      <h5 class="text-muted">i.e. "500 steps taken"</h5>

                      <div class="input-group">
                        <span class="input-group-addon active">
                            <input type="checkbox" aria-label="..." id="track_steps">
                        </span>
                        <input type="text" id="steps_value" class="form-control">
                        <span class="input-group-addon">steps taken</span>
                      </div>
                      <br>

                      <div class="input-group">
                        <span class="input-group-addon">
                            <input type="checkbox" aria-label="..." id="track_miles">
                        </span>
                        <input type="text" id="miles_value" class="form-control">
                        <span class="input-group-addon">miles traveled</span>
                      </div>
                      <br>

                      <div class="input-group">
                        <span class="input-group-addon">
                            <input type="checkbox" aria-label="..." id="track_calories">
                        </span>
                        <input type="text" id="calories_value" class="form-control">
                        <span class="input-group-addon">calories burned</span>
                      </div>
                      <br>

                      <div class="input-group">
                        <span class="input-group-addon">
                            <input type="checkbox" aria-label="..." id="track_lightly_active">
                        </span>
                        <input type="text" id="lightly_active_value" class="form-control">
                        <span class="input-group-addon">lightly active minutes</span>
                      </div>
                      <br>

                      <div class="input-group">
                        <span class="input-group-addon">
                            <input type="checkbox" aria-label="..." id="track_fairly_active">
                        </span>
                        <input type="text" id="fairly_active_value" class="form-control">
                        <span class="input-group-addon">fairly active minutes</span>
                      </div>
                      <br>

                      <div class="input-group">
                        <span class="input-group-addon">
                            <input type="checkbox" aria-label="..." id="track_very_active">
                        </span>
                        <input type="text" id="very_active_value" class="form-control">
                        <span class="input-group-addon">very active minutes</span>
                      </div>

                      <h5 class="btn btn-default" id="update_submit">Submit</h5>
                    </div>
                    <br>
                    <h3 id="up_output" style="display:none"></h3>
                    <hr>
                    <div class="hab_stats">
                      <h2>Habitica Stats:</h2>
                      <h4 >User: <span id="hab_name"></span></h4>
                      <h4 >Class: <span id="hab_class"></span></h4>
                      <h4 >Level: <span id="hab_level"></span></h4>

                      <h4>XP:</h4>
                      <div class="progress">
                          <div id="hab_xp_bar" class="progress-bar" role="progressbar" style="width: 20%;">
                            <span id="hab_xp_prog"></span>
                          </div>
                      </div>
                  </div>
              </div>

              <div class="col-md-4 habit-color">
                <img src="img/hab_logo.png" style="max-width:150px;" class="center-block">
                 <h3>Enter Habitica Data Here:</h3>
                  <div class="form-group">
                       <label class="control-label">User Id</label>
                       <input  class="form-control" type="text" id="user_id"/>
                       <br>
                       <label class="control-label">Api Token</label>
                      <input class="form-control" name="searchTxt" type="password" id="api_token"/><br>
                      <h5 class="btn btn-default" id="habitica_info_submit">Submit</h5>
                      <br>
                  </div>
                  <h3 id="hab_output" style="display:none"></h3>
                  <br><br>
              </div>
           </div>

           <hr>
           <p>Made with &#9829; by <a href="https://github.com/Lamikins">Lamikins</a>, updated by <a href="https://github.com/duplaja">Dan Dulaney</a></p>
       </div>
    </body>
</html>
