<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the Closure to execute when that URI is requested.
|
*/

// Route::get('/', function()
// {
// 	return View::make('hello');
// });


Route::get('/', 'HomeController@showHome');
Route::post('register', 'UserController@postRegister');
Route::post('login', 'UserController@postLogin');

Route::post('regPersonalDetails', 'UserController@postPersonalDetails');
Route::post('regJobDetails', 'UserController@postJobSeekerDetails');
Route::post('extraDetails', 'UserController@postExtraDetails');
Route::post('upload-video', 'UserController@postVideoDetails');

Route::get('getUserBasicDetails', 'UserController@getUserBasicDetails');

Route::get('dashboardDetails', 'UserController@getDashboardDetails');
Route::post('getResumses', 'UserController@getResumeDetails');
Route::get('myAccountDetails', 'UserController@getUserAccountDetailsForId');
Route::post('postJob', 'UserController@postJob');
Route::post('currentJobs', 'UserController@getPostedJobs');


Route::get('userDetails', 'UserController@getuserDataById');

