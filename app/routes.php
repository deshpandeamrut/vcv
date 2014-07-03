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
Route::post('Register', 'UserController@postRegister');
Route::post('regPersonalDetails', 'UserController@postPersonalDetails');
Route::post('regJobDetails', 'UserController@postJobSeekerDetails');
Route::post('extraDetails', 'UserController@postExtraDetails');

Route::get('getUserBasicDetails', 'UserController@getUserBasicDetails');
Route::post('login', 'UserController@postLogin');
Route::get('dashboardDetails', 'UserController@getDashboardDetails');
Route::post('getResumses', 'UserController@getResumeDetails');

Route::get('userDetails', 'UserController@getuserDataById');

