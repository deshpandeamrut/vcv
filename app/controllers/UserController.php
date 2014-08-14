<?php

class UserController extends BaseController {

	/*
	|--------------------------------------------------------------------------
	| Default Home Controller
	|--------------------------------------------------------------------------
	|
	| You may wish to use controllers instead of, or in addition to, Closure
	| based routes. That's great! Here is an example controller method to
	| get you started. To route to this controller, just add the route:
	|
	|	Route::get('/', 'HomeController@showWelcome');
	|
	*/

	public function __construct(User $user){
		$this->user = $user;
	}

	public function postRegister(){
		$input = Input::all();
		Log::info("postRegister -->value of Params Recvd ".var_export($input,true));
		$rules = array(
						'username' => 'Required|unique:users',
						'email' => 'Required|unique:users|email',
						'email_confirmation' => 'Required',
						'password' => 'Required'
					);
		$v = Validator::make($input, $rules);
		$responseJson = array();

		if(!$v->passes()){
			Log::error("postRegister --> There was some Validation Failures".var_export($v->messages(),true));
			$reasonData = $v->messages();
        	$reasonData = json_decode($reasonData,true);
        	foreach($reasonData as $row){
        		$reasonData = $row;
        	}
			$responseJson = json_encode(array("status_code" => 400,"status_message"=>"Validation Failure","data"=>array("Reason"=>$reasonData)));
			Log::info("postRegister --> Sending of Response Params ".$responseJson);
			return $responseJson;
		}
		$password = $input['password'];
		$password = Hash::make($password);
		$user = new User();
		$user->username = $input['username'];
		$user->email = $input['email'];
		$user->password = $password;
		$user->user_type = $input['user_type'];
		$user->created_by = $input['email'];
		$user->updated_by = $input['email'];
		try{
			$user->save();
			Log::info("postRegister --> Successfully Registered");
			$email = $input['email'];
			$key = hash('sha512', uniqid());
			//$this->sendConfirmation($email, $key, $input['username']);
			$credentials = array('email' => $input['email'], 'password' => $input['password']);
			if(Auth::attempt($credentials)){	
				Log::info("postRegister --> Successfully Registered For User ".$input['email']);
				$repsonseArray = $this->getUserData();
				$responseJson = json_encode(array("status_code" => 200,"status_message"=>"Succesfully Registered","data"=> $repsonseArray));
				Log::info("postRegister --> Sending of Response Params ".$responseJson);
				return $responseJson;
			}else{
				Log::info("postRegister -->Some Problem Occured While Logging In for Email Id".$input['email']);
				$responseJson = json_encode(array("status_code" => 500,"status_message"=>"Failure While Logging In ","data"=>array()));
				Log::info("postRegister --> Sending of Response Params  ".$responseJson);
				return $responseJson;
			}
		}catch(Exception $e){
			Log::error("There was some Error".$e->getMessage());
			$responseJson = json_encode(array("status_code" => 500,"status_message"=>"Internal Server Error","data"=>array("Reason"=>$e->getMessage())));
			Log::info("Sending of Response Params postRegister ".$responseJson);
			return $responseJson;
		}
	} // end of function postRegister

	public function sendConfirmation($email, $key, $first_name)
	{
		
		$data['name'] = $first_name;
		$data['email'] = $email;
		$data['key'] = $key;
		Mail::send('activationMail', $data, function($m) use($email){
				$m->to($email)->subject('Verify Email');
			});
	}
	
/* function for Social Auth Login */
	public function socialAuth($action = "", $type = ""){	
		Log::info("socialAuth --> Entering Function Social Auth");
		$responseJson = array();
		if ($action == "auth") {
			try{
				Log::info("socialAuth --> Action is equal to auth");
				Hybrid_Endpoint::process();
			}catch (Exception $e) {
				Log::error("socialAuth --> There was some Error".$e->getMessage());
				$responseJson = json_encode(array("status_code" => 400,"status_message"=>"Bad Request","data"=>array("Reason"=>$e->getMessage())));
				return $responseJson;
			}
		}else{
			try{
				if(empty($type)){
					Log::error("socialAuth --> User Type Mandatory");
					$responseJson = json_encode(array("status_code" => 400,"status_message"=>"Bad Request","data"=>array("Reason"=>"User Type Mandatory")));
					return $responseJson;
				}
				$socialAuth = new Hybrid_Auth(app_path() . '/config/hybridauth.php');
				$provider = $socialAuth->authenticate($action);
				$userProfile = $provider->getUserProfile();
				Log::info("socialAuth --> data of userProfile".var_export($userProfile,true));
				$data['id'] = $userProfile->identifier;
				$data['email'] = $userProfile->emailVerified;
				$email = $data['email'];
				$data['username'] = $userProfile->emailVerified;
				$data['user_type'] = $type;
				//$data['country_code'] = Input::get('country_code');
				$data['country_code'] = 'Aus';
				Log::info("Value of Action ".$action);
				if($action=='facebook') $data['column_name'] = 'fb_auth_id';
				if($action=='google') $data['column_name'] = 'gmail_auth_id';
				if($action=='linkedin') $data['column_name'] = 'linked_in_auth_id';
				$string = str_random(40);
				$data['social_auth_password'] = Hash::make($string);
				$user = new User();
				$user->updateSocialId($data);
				$id = $this->user->getUserIdByEmail($email);
				$user = $this->user->find($id);
				Auth::login($user);
				$provider->logout();
				return Redirect::to('dashboard.html#/');
			}catch (Exception $e) {
				Log::error("socialAuth --> There was some Error".$e->getMessage());
				$responseJson = json_encode(array("status_code" => 500,"status_message"=>"Internal Server Error","data"=>array("Reason"=>"Server Error")));
				return $responseJson;
			}
		} // end of else
	} // end of function socialAuth

	public function postLogin(){
		$input = Input::all();
		Log::info("value of Params Recvd postLogin ".var_export($input,true));
		$rules = array(
						'username' => 'required',
						'login_password' => 'required',
					  );

		$v = Validator::make($input, $rules);
		$responseJson = array();

		if($v->passes()){		
			$login_status = false;
			try{
				$credentials = array('email' => $input['username'], 'password' => $input['login_password']);
				if(Auth::attempt($credentials)){
					$login_status = true;
				}else{
					$credentials = array('username' => $input['username'], 'password' => $input['login_password']);
					if(Auth::attempt($credentials)){
						$login_status = true;
					}
				}
				if($login_status){
					Log::info("Successfully Logged In For User ".$input['username']);
					$repsonseArray = $this->getUserData();
					$responseJson = json_encode(array("status_code" => 200,"status_message"=>"Succesfully Logged In","data"=> $repsonseArray));
				}else{
					Log::info("Incorrect Login Details Entered".$input['username']);
					$responseJson = json_encode(array("status_code" => 400,"status_message"=>"Invalid Request","data"=>array("Reason" => "Incorrect Username/Password")));
				}
			}catch (Exception $e) {
				Log::error("There was some Error".$e->getMessage());
				$responseJson = json_encode(array("status_code" => 500,"status_message"=>"Internal Server Error","data"=>array("Reason"=>$e->getMessage())));
			}
		}else{
			Log::error("There was some Validation Failures".var_export($v->messages(),true));
			$reasonData = $v->messages();
        	$reasonData = json_decode($reasonData,true);
        	foreach($reasonData as $row){
        		$reasonData = $row;
        	}
			$responseJson = json_encode(array("status_code" => 400,"status_message"=>"Validation Failure","data"=>array("Reason"=>$reasonData)));
		}
		Log::info("postLogin --> Sending Response".$responseJson);
		return $responseJson;
	}

/* Ends Post Login */

	public function logout(){
		Auth::logout();
		$responseJson = json_encode(array("status_code" => 200,"status_message"=>"Succesfully Logged Out","data"=> array("Reason"=>"Succesfully Logged Out")));
		return $responseJson;
	}

/* postPersonalDetails Function Starts Here */

	public function postPersonalDetails(){
		if(empty(Auth::user()->id)){
   			Log::info("postPersonalDetails --> User Not Logged In.. Please Check");
   			$repsonseArray = array("Reason"=>"User Not Logged in");
   			$responseJson = json_encode(array("status_code" => 401,"status_message"=>"Unauthorized","data"=> $repsonseArray));
   			Log::info("postPersonalDetails --> Sending of Response Params".$responseJson);
			return $responseJson;
  		}
  		$input = Input::all();
  		$fileReferences = array();
		Log::info("postPersonalDetails --> value of Params Recvd postPersonalDetails ".var_export($input,true));
		if(array_key_exists('files_reference', $input)){
			$fileReferences = $input['files_reference'];	
			$fileReferences = json_decode($fileReferences,true);
		}
		Log::info("postPersonalDetails --> value of Params Recvd Decoded fileReferences ".var_export($fileReferences,true));
		$countOfFilesUploaded = count($fileReferences);
		Log::info("postPersonalDetails --> Count of no of files Uploaded fileReferences ".var_export($countOfFilesUploaded,true));
		$rules_personal = array(
							'first_name' => 'Required',
							'dob' => 'required'
						  );
		$rules_address = array(
							'street_no' => 'required',
							'street_name' => 'required',
							'postcode' => 'required',
							'city_name' => 'required',
							'state_name' => 'required'
						 );
		$rules_phone = array(
						'phone_city_code' => 'required',
						'phone_number' => 'required'
						);
		$userAddress = json_decode($input['address'],true);
		Log::info("postPersonalDetails --> User Address Details ".var_export($userAddress,true));
		$userPhone = json_decode($input['phone'],true);
		Log::info("postPersonalDetails --> User Phone Details ".var_export($userPhone,true));
		$v1_personal = Validator::make($input, $rules_personal);
		$v1_address = Validator::make($userAddress, $rules_address);
		if($v1_personal->fails() || $v1_address->fails() ){
			$val_flag = false;
			$personalFailure = $v1_personal->messages();
			$addressFailure =  $v1_address->messages();
			Log::error("postPersonalDetails --> There was some Validation Failures".var_export($personalFailure,true));
			Log::error("postPersonalDetails --> There was some Validation Failures".var_export($addressFailure,true));
			$responseJson = json_encode(array("status_code" => 400,"status_message"=>"Validation Error","data"=>array("Reason"=>"Mandatory Fields Required")));
			Log::info("Sending of Response Params postLoanDetails ".$responseJson);
			return $responseJson;
		}
		try{
			$input['user_id'] = Auth::user()->id;
			$input['email_id'] = Auth::user()->email;
			$input['is_profile_complete'] = 0;
			$result = $this->user->updateUserDetails($input);
			Log::info("postPersonalDetails --> Successfully Stored User Details");
           	$addressObj = new Addresses();
           	$phoneObj = new Phones();
			$userAddress['user_id'] = $input['user_id'];
			$userAddress['email_id'] = $input['email_id'];
			$userAddress['address_type'] = 'user';
			$result = $addressObj->addUpdateAddress($userAddress);
			Log::info("postPersonalDetails --> Successfully Stored Address Details");
			$PhoneKeys = array_keys($userPhone);
			$counter = 0;
			foreach($userPhone as $row){
				$insertdata = array(
					'user_id' => $input['user_id'],
					'email_id' => $input['email_id'],
					'phone_type' => $PhoneKeys[$counter],
					'phone_city_code' => $row['phone_city_code'],
					'phone_number' => $row['phone_number']
				);
				$result = $phoneObj->addPhone($insertdata);
				Log::info("postPersonalDetails --> Successfully Phone Details");
				$counter = $counter + 1;
			}
			Log::info("postPersonalDetails --> Succesfully Saved PersonalDetails");
			//Auth::user()->profile_status
			$responseJson = json_encode(array("status_code" => 200,"status_message"=>"Succesfull","data"=>array("profile_status"=>'job',"is_profile_complete"=>Auth::user()->is_profile_complete)));
			Log::info("Sending of Response Params postLoanDetails ".$responseJson);
			return $responseJson;
		}catch(Exception $e){
			Log::error("postPersonalDetails --> There was some Error".$e->getMessage());
			$responseJson = json_encode(array("status_code" => 500,"status_message"=>"Internal Server Error","data"=>array("Reason"=>"Internal Server Error")));
			Log::info("Sending of Response Params postLoanDetails ".$responseJson);
			return $responseJson;
		}
	} // end of function postPersonalDetails 
	
/* postPersonalDetails Function Ends Here */


/* postLoanDetails Function Starts Here */
	
	public function postJobSeekerDetails(){
		if(empty(Auth::user()->id)){
   			Log::info("User Not Logged In.. Please Check");
   			$repsonseArray = array("Reason"=>"User Not Logged in");
   			$responseJson = json_encode(array("status_code" => 401,"status_message"=>"Unauthorized","data"=> $repsonseArray));
   			Log::info("postJobSeekerDetails -->Sending of Response Params postLoanDetails ".$responseJson);
			return $responseJson;
  		}
  		$input = Input::all();
  		Log::info("postJobSeekerDetails -->value of Params Recvd postJobSeekerDetails ".var_export($input,true));
  		$fileReferences = '';
  		if(array_key_exists('files_reference', $input)){
			$fileReferences = json_decode($input['files_reference'],true);
		}
		Log::info("postJobSeekerDetails --> value of Params Recvd Decoded fileReferences ".var_export($fileReferences,true));
		$countOfFilesUploaded = count($fileReferences);
		$rules = array(
						'resume_headline' => 'Required',
						'job_category' => 'Required',
						'skill_sets' => 'Required',
						'preferred_location' => 'Required',
						'total_experience' => 'Required'
					);
		$rules_employment = array(
									"yearly_salary" => 'Required',
									"basis_of_employment" => 'Required',
									"profession" => 'Required',
									"industry" => 'Required',
									"employment_period_years" => 'Required',
									"employment_period_months" => 'Required',
									"functional_area" => 'Required',
									"employment_role" => 'Required'
								 );
		$v = Validator::make($input, $rules);
		if($v->fails()){
			Log::error("postJobSeekerDetails -->There was some Validation Failures postJobSeekerDetails");
			$validationFailure = $v->messages();
			$validationFailure = json_decode($validationFailure,true);
			Log::error("postJobSeekerDetails -->There was some Validation Failures postJobSeekerDetails: ".var_export($validationFailure,true));
			foreach($validationFailure as $row){
				$validationFailure = $row;
			}
			$responseJson = json_encode(array("status_code" => 400,"status_message"=>"Validation Failure","data"=>array("Reason"=>$validationFailure)));
			Log::info("postJobSeekerDetails -->Sending of Response Params postJobSeekerDetails ".$responseJson);
			return $responseJson;
		}
		$currentEmp = json_decode($input['current_employment'],true);
		$v_current_emp = Validator::make($currentEmp, $rules_employment);
		if($v_current_emp->fails()){
			$failureData = $v_current_emp->messages();
			Log::info("postJobSeekerDetails--> Validation Failure".var_export($failureData,true));
			$responseJson = json_encode(array("status_code" => 400,"status_message"=>"Validation Failure","data"=>array("Reason"=>"Validation Failure")));
			Log::info("postJobSeekerDetails--> Sending of Response Params  ".$responseJson);
			return $responseJson;
		}
		try{
			$input['user_id'] = Auth::user()->id;
			$input['email_id'] = Auth::user()->email;
			$objJobSeekerDetails = new JobSeekerDetails();
			$objJobSeekerEmploymentDetails = new JobSeekerEmploymentDetails();
			$result = $objJobSeekerDetails->addseekerDetails($input);
			Log::info("postJobSeekerDetails -->Succesfully Saved JobSeekerDetails");
			$currentEmp['user_id'] = Auth::user()->id;
			$currentEmp['email_id'] = Auth::user()->email;
			$currentEmp['employment_type'] = 'current';
			$objJobSeekerEmploymentDetails->addemployementDetails($currentEmp);
			$priorEmp = json_decode($input['previous_employments'],true);
			if(!empty($priorEmp)){
				foreach($priorEmp as $row){
					if(!empty($row)){
						$row['user_id'] = Auth::user()->id;
						$row['email_id'] = Auth::user()->email;
						$row['employment_type'] = 'prior';
						$result = $objJobSeekerEmploymentDetails->addemployementDetails($row);
						Log::info("postJobSeekerDetails--> Succesfully Saved Prior Employement Details");
					}
				}
			}
			Log::info("postJobSeekerDetails--> Now going to Upload Files");
			$fileCounter = 0;
			if(!empty($fileReferences)){
				$fileReferencesKeys = array_keys($fileReferences);
				if($countOfFilesUploaded > 0){
					for($fcounter = 0;$fcounter < $countOfFilesUploaded;$fcounter++){
						Log::info("postPersonalDetails --> value of FCounter ".$fileCounter);
						if(array_key_exists("file$fileCounter", $input)){
							$imageFileDetails = $input["file$fileCounter"];
							if(!empty($imageFileDetails)){
								$attachmentInfo = $fileReferencesKeys[$fcounter];
								$destinationPath = '/home/ubuntu/vcv/public/resumes/';
								$dbPath = 'resumes/';
								$filename = $imageFileDetails->getClientOriginalName();
								$imageFileDetails->move($destinationPath, $filename);
								$insertdata = array(
													'user_id' => $input['user_id'],
													'email_id' => $input['email_id'],
													'attachment_type' => 'user',
													'attachment_info' => $attachmentInfo,
													'attachment_usage' => 'resume',
													'attachment_name' => $filename,
													'attachment_path' => $dbPath
													);
								$attachmentObj = new Attachments();
								$result = $attachmentObj->addAttachment($insertdata);
							} // end of imageFileDetails
							$fileCounter ++ ;
						} // end of For fcounter
					} // end of for counter
				} // end of countOfFilesUploaded
			}// end of fileReferences
			Log::info("postJobSeekerDetails -->Succesfully Saved Current Employement");
			$responseJson = json_encode(array("status_code" => 200,"status_message"=>"Succesfull","data"=>array("profile_status"=>Auth::user()->profile_status,"is_profile_complete"=>Auth::user()->is_profile_complete)));
			Log::info("postJobSeekerDetails -->Sending of Response Params postJobSeekerDetails ".$responseJson);
			return $responseJson;
		}catch(Exception $e){
			Log::error("postJobSeekerDetails --> There was some Error".$e->getMessage());
			$responseJson = json_encode(array("status_code" => 500,"status_message"=>"Internal Server Error","data"=>array("Reason"=>"Internal Server Error")));
			Log::info("postJobSeekerDetails -->Sending of Response Params ".$responseJson);
			return $responseJson;
		}
	} // end of function postLoanDetails

/* postJobSeekerDetails Function Ends Here */

/* postExtraDetails Function Starts Here */

	public function postExtraDetails(){
		if(empty(Auth::user()->id)){
   			Log::info("User Not Logged In.. Please Check");
   			$repsonseArray = array("Reason"=>"User Not Logged in");
   			$responseJson = json_encode(array("status_code" => 401,"status_message"=>"Unauthorized","data"=> $repsonseArray));
  			Log::info("postExtraDetails--> Sending of Response Params ".$responseJson);
			return $responseJson;
  		}
		$input = Input::all();
		Log::info("postExtraDetails--> value of Params Recvd ".var_export($input,true));
		$classTenDetails = $input['class_10_details'];
		$classTwelveDetails = $input['class_12_details'];
		$bDegreeDetails = $input['b_degree_details'];
		$projectDetails = $input['project_details'];
		$addProjectDetails = $input['more_projects'];

		try{
			$userId= Auth::user()->id;
			$emailId = Auth::user()->email;
			$objJobSeekerEducationDetails = new JobSeekerEducationDetails();
			$objJobSeekerProjectDetails = new JobSeekerProjectDetails();
			$classTenDetails['user_id'] = $userId;
			$classTenDetails['email_id'] = $emailId;
			$classTwelveDetails['user_id'] = $userId;
			$classTwelveDetails['email_id'] = $emailId;
			$bDegreeDetails['user_id'] = $userId;
			$bDegreeDetails['email_id'] = $emailId;
			$projectDetails['user_id'] = $userId;
			$projectDetails['email_id'] = $emailId;

			$objJobSeekerEducationDetails->addeducationDetails($classTenDetails);
			$objJobSeekerEducationDetails->addeducationDetails($classTwelveDetails);
			$objJobSeekerEducationDetails->addeducationDetails($bDegreeDetails);
			Log::info("postExtraDetails--> Succesfully added Educational Details");

			$objJobSeekerProjectDetails->addprojectDetails($projectDetails);
			Log::info("postExtraDetails--> Succesfully Saved Degree Details");
			if(!empty($addProjectDetails)){
				foreach ($$addProjectDetails as $key => $value) {
					$value['user_id'] = $userId;
					$value['email_id'] = $emailId;
					$objJobSeekerProjectDetails->addprojectDetails($value);
				}
			}
			$responseJson = json_encode(array("status_code" => 200,"status_message"=>"Succesfull","data"=>array("is_profile_complete"=>1)));
			Log::info("postExtraDetails--> Sending of Response Params postFinancialDetails ".$responseJson);
			return $responseJson;
		}catch(Exception $e){
			Log::error("postExtraDetails --> There was some Error".$e->getMessage());
			$responseJson = json_encode(array("status_code" => 500,"status_message"=>"Internal Server Error","data"=>array("Reason"=>$e->getMessage())));
			Log::info("postExtraDetails--> Sending of Response Params postFinancialDetails ".$responseJson);
			return $responseJson;
		}
	}

/* postExtraDetails Function Ends Here */


/* postInvestorDetails Function Starts Here */
	public function postInvestorDetails(){
		if(empty(Auth::user()->id)){
   			Log::info("User Not Logged In.. Please Check");
   			$repsonseArray = array("Reason"=>"User Not Logged in");
   			$responseJson = json_encode(array("status_code" => 401,"status_message"=>"Unauthorized","data"=> $repsonseArray));
   			Log::info("postInvestorDetails --> Sending of Response Params ".$responseJson);
			return $responseJson;
  		}
		$input = Input::all();
		Log::info("postInvestorDetails --> value of Params Recvd ".var_export($input,true));
		$investorParams = json_encode($input);
		$investorParams = json_decode($investorParams,true);
		Log::info("postInvestorDetails --> value of Params Recvd investorParams".var_export($investorParams,true));

		$rules_personal= array('first_name' => 'Required','dob' => 'required');
		$rules_address = array(
								'state_name' => 'required',
								'city_name' => 'required',
								'postcode' => 'required',
								'suburb' => 'required',
								'street_no' => 'required',
								'street_name' => 'required'
							  );

		$rules_bankdetail = array(
									'bank_name' => 'Required',
									'account_holder_name' => 'Required',
									'account_number' => 'Required',
									'branch_name' => 'Required'
								  );

		$address = $investorParams['address'];
		$address = json_decode($address,true);
		
		$phone = $investorParams['phone'];
		$phone = json_decode($phone,true);
		$bankdetail = $investorParams['bankdetail'];
		$bankdetail = json_decode($bankdetail,true);

		$v_personal = Validator::make($investorParams, $rules_personal);
		$v_address = Validator::make($address, $rules_address);
		$v_bankdetail = Validator::make($bankdetail, $rules_bankdetail);
		if($v_personal->fails()||$v_address->fails()||$v_bankdetail->fails()){
			Log::error("postInvestorDetails --> There was some Validation Failures");
			$responseJson = json_encode(array("status_code" => 400,"status_message"=>"Validation Failure","data"=>array("Reason"=>"Validation Failed")));
			Log::info("postInvestorDetails --> Sending of Response Params ".$responseJson);
			return $responseJson;
		}
		try{
			$investorParams['user_id'] = Auth::user()->id;
			$investorParams['email_id'] = Auth::user()->email;
			$countryObj = new CountryDataModel();
			$phone_country_code = $countryObj->getPhoneCodeByCountryCode(Auth::user()->country_code);
			$country_name = $countryObj->getCountryNameByCountryCode(Auth::user()->country_code);
			$investorParams['country_code'] = $country_name;
			$investorParams['is_profile_complete'] = 1;
			$result = $this->user->updateUserDetails($investorParams);
			$addressObj = new AddressModel();
			$address['user_id'] = $investorParams['user_id'];
			$address['email_id'] = $investorParams['email_id'];
			$address['address_type'] = 'user';
			$address['property_id'] = 0;
			$result = $addressObj->addAddress($address);
			$phoneObj = new PhoneModel();
			$insertdata = array(
							'user_id' => $investorParams['user_id'],
							'email_id' => $investorParams['email_id'],
							'phone_type' => 'mobile',
							'phone_country_code' => $phone_country_code,
							'phone_city_code' => $phone['phone_city_code'],
							'phone_number' => $phone['phone_number']
							);
			$result = $phoneObj->addPhone($insertdata);
			if(array_key_exists('file0',$input)){
				$imageFileDetails = $input["file0"];
				if(!empty($imageFileDetails)){
					$destinationPath = '/home/dev2/mortgagechance/public/mc_profile_images/';
					$dbPath = '/mc_profile_images/';
					$filename = $imageFileDetails->getClientOriginalName();
					$imageFileDetails->move($destinationPath, $filename);
					$insertdata = array(
										'user_id' => $investorParams['user_id'],
										'email_id' => $investorParams['email_id'],
										'image_type' => 'user',
										'image_name' => $filename,
										'image_path' => $dbPath,
										);
					$imageObj = new ImageModel();
					$result = $imageObj->addImage($insertdata);
				}
			}
			$bankDetailsObj = new BankDetailsModel();
			$bankdetail['user_id'] = $investorParams['user_id'];
			$bankdetail['email_id'] = $investorParams['email_id'];
			$result = $bankDetailsObj->addBankDetails($bankdetail);
			$this->user->updateIsProfileComplete($investorParams['user_id'], 1);
			$result = $this->user->updateUserVerificationById($investorParams['user_id'], $investorParams['email_id'], 'verified');
			Log::info("postInvestorDetails --> Succesfully Saved InvestorDetails and updated is profile complete and verification status");
			
			$responseJson = json_encode(array("status_code" => 200,"status_message"=>"Succesfull","data"=>array("is_profile_complete"=> 1)));
			Log::info("postInvestorDetails --> Sending of Response Params ".$responseJson);
			return $responseJson;
		}catch(Exception $e){
			Log::error("There was some Error".$e->getMessage());
			$responseJson = json_encode(array("status_code" => 500,"status_message"=>"Internal Server Error","data"=>array("Reason"=>"Internal Server Error")));
			Log::info("Sending of Response Params postInvestorDetails ".$responseJson);
			return $responseJson;
		}
	}
/* postInvestorDetails Function Ends Here */


/* postEmploymentDetails Function Starts Here */

	public function postEmploymentDetails(){
		if(empty(Auth::user()->id)){
   			Log::info("User Not Logged In.. Please Check");
   			$repsonseArray = array("Reason"=>"User Not Logged in");
   			$responseJson = json_encode(array("status_code" => 401,"status_message"=>"Unauthorized","data"=> $repsonseArray));
   			Log::info("postEmploymentDetails --> Sending of Response Params postLoanDetails ".$responseJson);
			return $responseJson;
  		}
		$input = Input::all();
		Log::info("postEmploymentDetails --> value of Params Recvd".var_export($input,true));
		$noOfApplicants =intval($input['no_of_applicants']);
		$firstBorrowerDetails = $input['borrower1'];
		$secondBorrowerDetails = $input['borrower2'];
		$rules_employment = array(
						'employer_name' => 'Required',
						'salary' => 'required',
						'frequency_of_salary' => 'required',
						'occupation' => 'required',
						'industry' => 'required',
						'employer_contact_number' => 'required',
						'employment_period' => 'required',
						'basis_of_employment' => 'required',
					);
		$val_flag = true;
		$firstBorrowerCurrentEmp = $firstBorrowerDetails['current'];
		$firstBorrowerPrior = $firstBorrowerDetails['previous'];
		$firstBorrowerOther = $firstBorrowerDetails['other'];
		$v1_current = Validator::make($firstBorrowerCurrentEmp, $rules_employment);
		if($v1_current->fails()){
			$val_flag = false;
			$firstBorrowerCurrentEmpFailure =  $v1_current->messages();
			$firstBorrowerCurrentEmpFailure = json_decode($firstBorrowerCurrentEmpFailure,true);
			foreach($firstBorrowerCurrentEmpFailure as $row){
				$firstBorrowerCurrentEmpFailure = $row;
			}
		    Log::error("postEmploymentDetails --> There was some Validation Failures".var_export($firstBorrowerCurrentEmpFailure,true));
			$responseJson = json_encode(array("status_code" => 401,"status_message"=>"Unauthorized","data"=>array("Reason"=> $firstBorrowerCurrentEmpFailure)));
			Log::info("postEmploymentDetails --> ending of Response Params ".$responseJson);
			return $responseJson;
		}
		if($val_flag != false){
			if($noOfApplicants ==2){
				if(!empty($secondBorrowerDetails)){
					$secondBorrowerCurrentEmp = $secondBorrowerDetails['current'];
					$secondBorrowerPriorEmp = $secondBorrowerDetails['previous'];
					$secondBorrowerOthers = $secondBorrowerDetails['other'];
					$v2_current = Validator::make($current2, $rules_employment);
					if($v2_current->fails()){
						$val_flag = false;
						$secondBorrowerFailure =  $v2_current->messages();
						foreach($secondBorrowerFailure as $row){
							$secondBorrowerFailure = $row;
						}
					    Log::error("postEmploymentDetails --> There was some Validation Failures".var_export($secondBorrowerFailure,true));
						$responseJson = json_encode(array("status_code" => 401,"status_message"=>"Unauthorized","data"=>array("Reason"=> $secondBorrowerFailure)));
						Log::info("postEmploymentDetails --> ending of Response Params ".$responseJson);
						return $responseJson;
					}
				}
			}
		}
		if($val_flag == false){
			Log::error("There was some Validation Failures postEmploymentDetails");
			$responseJson = json_encode(array("status_code" => 400,"status_message"=>"Validation Failure","data"=>array("Reason"=>"Validation Failed")));	
			Log::info("postEmploymentDetails --> ending of Response Params ".$responseJson);
			return $responseJson;
		}
		try{
			Log::info("Calling addEmploymentDetails with Params ".var_export($borrower1,true));
			$employmentDetailsObj = new EmploymentDetailsModel();
			$firstBorrowerCurrentEmp['user_id'] = Auth::user()->id;
			$firstBorrowerCurrentEmp['email_id'] = Auth::user()->email;
			$firstBorrowerCurrentEmp['employment_type'] = 'current';
			$result = $employmentDetailsObj->addEmploymentDetails($firstBorrowerCurrentEmp);
			if(!empty($firstBorrowerPrior)){
				foreach($firstBorrowerPrior as $row){
					$row['user_id'] = Auth::user()->id;
					$row['email_id'] = Auth::user()->email;
					$row['employment_type'] = 'previous';
					$result = $employmentDetailsObj->addEmploymentDetails($row);	
				}
			}
			if(!empty($firstBorrowerOther)){
				$firstBorrowerOther['user_id'] = Auth::user()->id;
				$firstBorrowerOther['email_id'] = Auth::user()->email;
				$firstBorrowerOther['employment_type'] = 'other';
				$result = $employmentDetailsObj->addEmploymentDetails($firstBorrowerOther);
			}
			if($noOfApplicants ==2){
				if(!empty($secondBorrowerDetails)){
					Log::info("Calling addEmploymentDetails with Params ".var_export($secondBorrowerDetails,true));
					$borrowerRelationObj = new FirstSecondBorrowerRelationModel();
					$second_borrower_id = $borrowerRelationObj->getSecondBorrowerByFirstBorrowerId(Auth::user()->id);
					$second_borrower_email = $this->user->getEmailById($second_borrower_id);
					$secondBorrowerCurrentEmp['user_id'] = $second_borrower_id;
					$secondBorrowerCurrentEmp['email_id'] = $second_borrower_email;
					$secondBorrowerCurrentEmp['employment_type'] = 'current';
					$result = $employmentDetailsObj->addEmploymentDetails($secondBorrowerCurrentEmp);
					if(!empty($secondBorrowerPriorEmp)){
						foreach($secondBorrowerPriorEmp as $row){
							$row['user_id'] = $second_borrower_id;
							$row['email_id'] = $second_borrower_email;
							$row['employment_type'] = 'previous';
							$result = $employmentDetailsObj->addEmploymentDetails($row);	
						}
					}
					if(!empty($secondBorrowerOthers)){
						$secondBorrowerOthers['user_id'] = Auth::user()->id;
						$secondBorrowerOthers['email_id'] = Auth::user()->email;
						$secondBorrowerOthers['employment_type'] = 'other';
						$result = $employmentDetailsObj->addEmploymentDetails($secondBorrowerOthers);
					}
				}
			}
			if(isset($input['type'])){
				if($input['type'] == 'myaccount'){
					$data['userId'] = Auth::user()->id;
					$data['status'] = 'unverified';
					$data['verifiedBy'] = '';
					$result = $this->user->updateUserVerificationById($data);		
					Log::info("postEmploymentDetails --> Successfully unverified user");
				}
			}else{
				$this->user->updateProfileStatus(Auth::user()->id, 'financial');
				Log::info("postEmploymentDetails --> Succesfully updated profile status");
			}
			Log::info("postEmploymentDetails --> Succesfully Saved EmploymentDetails");
			$responseJson = json_encode(array("status_code" => 200,"status_message"=>"Succesfull","data"=>array("profile_status"=>Auth::user()->profile_status,"is_profile_complete"=>Auth::user()->is_profile_complete)));
			Log::info("postEmploymentDetails --> ending of Response Params ".$responseJson);
			return $responseJson;
		}catch(Exception $e){
			Log::error("postEmploymentDetails -->There was some Error".$e->getMessage());
			$responseJson = json_encode(array("status_code" => 500,"status_message"=>"Internal Server Error","data"=>array("Reason"=>"Internal Server Error")));
	  		Log::info("postEmploymentDetails --> Sending of Response Params postLoanDetails ".$responseJson);
			return $responseJson;
		}
	}

/* postEmploymentDetails Function Ends Here */
	
/* getUserBasicDetails */
	public function getUserBasicDetails(){
		try{
			$userData = $this->getUserData();
			$responseJson = json_encode(array("status_code" => 200,"status_message"=>"Succesfully","data"=> $userData));
			Log::info("getUserBasicDetails --> Sending of Response Params postInvestorDetails ".$responseJson);
			return $responseJson;
		}catch(Exception $e){
			Log::error("getUserBasicDetails --> There was some Error".$e->getMessage());
			$responseJson = json_encode(array("status_code" => 401,"status_message"=>"User Not Logged In","data"=>array("Reason"=>"User Not Logged In")));
			Log::info("getUserBasicDetails --> Sending of Response Params postInvestorDetails ".$responseJson);
			return $responseJson;
		}
	}
/* getUserBasicDetails */

	public function getUserData(){
		if( empty( Auth::user()->id ) ){
			Log::info("getUserData --> User Not Logged In... Please Check");
	        throw new Exception(" User Not logged In");
		}else
		{	//Auth::user()->profile_status
			$repsonseArray = array(	
								"id"=>Auth::user()->id,
								"email"=>Auth::user()->email,
								"username"=>Auth::user()->username,								
								"first_name"=>Auth::user()->first_name,
								"country_code"=>Auth::user()->country_code,
								"status"=>Auth::user()->status,//'unverified'
								"user_type"=>Auth::user()->user_type,
								"memebership_type"=>Auth::user()->memebership_type,
								"credit_rating"=>Auth::user()->credit_rating,
								"is_activated"=>Auth::user()->is_activated,
								"profile_status"=>'job',
								"is_profile_complete"=>Auth::user()->is_profile_complete
							   );
			if(Auth::user()->user_type == 'employee'){
				$repsonseArray['is_employee'] = 1;
			}else{
					$repsonseArray['is_employee'] = 0;
			}
		    return $repsonseArray;		
		} // end of else
		
	} // end of function getUserData

	public function getUserAccountDetails(){
		$input = Input::all();
		Log::info("getUserAccountDetails --> value of Params Recvd".var_export($input,true));
		$rules = array(
						'user_id' => 'Required'
					);
		$v = Validator::make($input, $rules);
		if(!($v->passes())){
			$repsonseArray = array("Reason"=>"User Id Mandatory Param");
			$responseJson = json_encode(array("status_code" => 400,"status_message"=>"Bad Request","data"=> $repsonseArray));
			Log::info("getUserAccountDetails --> Sending of Response Params myAccount ".$responseJson);
			return $responseJson;
		}
		$userId = intval($input['user_id']);
		try{
			$data = $this->getUserDetails($userId);
			$responseJson = json_encode(array("status_code" => 200,"status_message"=>"Received data for user ".$userId,"data"=> $data));
			Log::info("getUserAccountDetails --> Sending of Response Params myAccount ".$responseJson);
			return $responseJson;
		}catch(Exception $e){
			Log::error("getUserAccountDetails --> There was some Error".$e->getMessage());
			$responseJson = json_encode(array("status_code" => 500,"status_message"=>"Internal Server Error","data"=>array("Reason"=>"Internal Server Error")));
			Log::info("getUserAccountDetails --> Sending of Response Params myAccount ".$responseJson);
			return $responseJson;
		}
	}

	public function getUserAccountDetailsForId(){
		$input = Input::all();
		Log::info("postEmploymentDetails --> value of Params Recvd".var_export($input,true));
		$rules = array(
						'user_id' => 'Required'
					);
		$v = Validator::make($input, $rules);
		if(!($v->passes())){
			$repsonseArray = array("Reason"=>"User Id Mandatory Param");
			$responseJson = json_encode(array("status_code" => 400,"status_message"=>"Bad Request","data"=> $repsonseArray));
			Log::info("getUserAccountDetails --> Sending of Response Params myAccount ".$responseJson);
			return $responseJson;
		}
		$userId = intval($input['user_id']);
		try{
			$data = $this->getUserAccountDetailsById($userId);
			$responseJson = json_encode(array("status_code" => 200,"status_message"=>"Received data for user ".$userId,"data"=> $data));
			Log::info("getUserAccountDetails --> Sending of Response Params myAccount ".$responseJson);
			return $responseJson;
		}catch(Exception $e){
			Log::error("getUserAccountDetails --> There was some Error".$e->getMessage());
			$responseJson = json_encode(array("status_code" => 500,"status_message"=>"Internal Server Error","data"=>array("Reason"=>"Internal Server Error")));
			Log::info("getUserAccountDetails --> Sending of Response Params myAccount ".$responseJson);
			return $responseJson;
		}
	}

	public function viewUserList(){
		if(empty(Auth::user()->id)){
   			Log::info("viewUserList --> User Not Logged In.. Please Check");
   			$repsonseArray = array("Reason"=>"User Not Logged in");
   			$responseJson = json_encode(array("status_code" => 401,"status_message"=>"Unauthorized","data"=> $repsonseArray));
   			Log::info("viewUserList --> Sending of Response Params ".$responseJson);
   			return $responseJson;
  		}
  		if( Auth::user()->user_type != 'admin'){
			Log::info("viewUserList --> User Not Admin");
   			$repsonseArray = array("Reason"=>"User Not Admin");
   			$responseJson = json_encode(array("status_code" => 400,"status_message"=>"User Not Admin","data"=> $repsonseArray));
   			Log::info("viewUserList --> Sending of Response Params ".$responseJson);
   			return $responseJson;
		}
		$input = Input::all();
		Log::info("viewUserList --> Params Recvd".var_export($input,true));
		if(array_key_exists('username', $input)) $userName = $input['username'];
		if(array_key_exists('user_status', $input)) $userStatus = $input['user_status'];
		if(array_key_exists('user_type', $input)) $userType = $input['user_type'];
		if(array_key_exists('created_date', $input)){
			if(!empty($input['created_date']))
				$createdDate = date('Y-m-d',strtotime($input['created_date']));
		} 
		$queryString = " select id,username,email,first_name as full_name,id_proof_points,status,membership_type,is_profile_complete,user_type,DATE_FORMAT(created_at, '%d-%m-%Y') AS created_date,created_at
						 from users where user_type <> 'admin' ";
		if( !empty($userStatus)){
			$queryString = $queryString . " and status = '".strval($userStatus)."'" ;
		}
		if( !empty($userType)){
			$queryString = $queryString . " and user_type = '".strval($userType)."'" ;
		}
		if( !empty($userName)){
			$queryString = $queryString . " and ( (username LIKE '%".strval($userName)."%') OR (email LIKE '%".strval($userName)."%') )";
		}
		if( !empty($createdDate)){
			$queryString = $queryString . " and date(created_at) = '".$createdDate."'" ;
		}
		$queryString = $queryString . " order by created_at desc ";
		Log::info(" Query String " . $queryString);
		try{
			$resultData = DB::select(DB::raw($queryString));
			$responseJson = json_encode(array("status_code" => 200,"status_message"=>"Success","data"=> $resultData));
			Log::info('viewUserList -->  Json Response sent'.var_export($responseJson,true));
			return $responseJson;
		}catch(Exception $e){
			Log::error("viewUserList --> There was some Error".$e->getMessage());
			$responseArray = array("Reason"=>"Internal Server Error");
			$responseJson = json_encode(array("status_code" => 500,"status_message"=>"Internal Server Error","data"=> $responseArray));
			Log::info('viewUserList -->  Json Response sent'.var_export($responseJson,true));
			return $responseJson;
		}
	}

	public function viewUserProfileDetails(){
		if(empty(Auth::user()->id)){
   			Log::info("viewUserProfileDetails --> User Not Logged In.. Please Check");
   			$repsonseArray = array("Reason"=>"User Not Logged in");
   			$responseJson = json_encode(array("status_code" => 401,"status_message"=>"Unauthorized","data"=> $repsonseArray));
   			Log::info("viewUserProfileDetails --> Sending of Response Params ".$responseJson);
   			return $responseJson;
  		}
  		if( Auth::user()->user_type != 'admin'){
			Log::info("viewUserProfileDetails --> User Not Admin");
   			$repsonseArray = array("Reason"=>"User Not Admin");
   			$responseJson = json_encode(array("status_code" => 400,"status_message"=>"User Not Admin","data"=> $repsonseArray));
   			Log::info("viewUserProfileDetails --> Sending of Response Params ".$responseJson);
   			return $responseJson;
		}
		try{
			$userId = Input::get('user_id');
			$responseArray = $this->getUserDetails($userId);
			Log::info("viewUserProfileDetails --> User With Id ".$userId." Retrieved Successfully");
			$responseJson = json_encode(array("status_code" => 200,"status_message"=>"Success","data"=> $responseArray));
		}catch(Exception $e){
			Log::error("viewUserProfileDetails --> There was some Error".$e->getMessage());
			$responseArray = array("Reason"=>"Internal Server Error");
			$responseJson = json_encode(array("status_code" => 500,"status_message"=>"Internal Server Error","data"=> $responseArray));
			return $responseJson;
		}
	}
	
	public function changeUserVerification(){
		if(empty(Auth::user()->id)){
   			Log::info("changeUserVerification -->User Not Logged In.. Please Check");
   			$repsonseArray = array("Reason"=>"User Not Logged in");
   			$responseJson = json_encode(array("status_code" => 401,"status_message"=>"Unauthorized","data"=> $repsonseArray));
   			Log::info("changeUserVerification --> Sending of Response Params ".$responseJson);
   			return $responseJson;
  		}
  		if( Auth::user()->user_type != 'admin'){
			Log::info("changeUserVerification --> User Not Admin");
   			$repsonseArray = array("Reason"=>"User Not Admin");
   			$responseJson = json_encode(array("status_code" => 400,"status_message"=>"User Not Admin","data"=> $repsonseArray));
   			Log::info("changeUserVerification --> Sending of Response Params ".$responseJson);
   			return $responseJson;
		}
		$updateParams = array();
		$input = Input::all();
		Log::info("changeUserVerification --> Recvd Request Params".var_export($input,true));
   		$rules = array(
						'user_id' => 'required',
						'borrower_rating' => 'required'
					  );
		$v = Validator::make($input, $rules);
		if(!($v->passes())){
			Log::info("changeUserVerification --> Mandatory Field Required");
   			$repsonseArray = array("Reason"=>"Mandatory Field Required");
   			$responseJson = json_encode(array("status_code" => 400,"status_message"=>"Mandatory Field Required","data"=> $repsonseArray));
   			Log::info("changeUserVerification --> Sending of Response Params".$responseJson);
			return $responseJson;
		}
		if(array_key_exists('status',$input)){
			$input['status'] = 'verified';
		}else{
			$input['status'] = 'unverified';
		}
		$input['verified_by'] = Auth::user()->email;
		try{
			if($input['status'] == 'unverified'){
				$input['status'] = 'verified';
				$result = $this->user->updateCreditRating($input);
				$result = $this->user->find($input['user_id']);
				$repsonseArray = array("Reason"=>"Successfully Verified");
				$responseJson = json_encode(array("status_code" => 200,"status_message"=>"Successfully Verified","data"=> $repsonseArray));
   				Log::info("changeUserVerification --> Sending of Response Params ".$responseJson);
				return $responseJson;
			}else{
				$input['status'] = 'unverified';
				$result = $this->user->updateUserVerificationById($input);
				$result = $this->user->find($input['user_id']);
				$repsonseArray = array("Reason"=>"Successfully UnVerified");
				$responseJson = json_encode(array("status_code" => 200,"status_message"=>"Successfully UnVerified","data"=> $repsonseArray));
   				Log::info("changeUserVerification --> Sending of Response Params ".$responseJson);
				return $responseJson;
			}
		}catch(Exception $e){
			Log::error("changeUserVerification --> There was some Error".$e->getMessage());
			$responseArray = array("Reason"=>"Internal Server Error");
			$responseJson = json_encode(array("status_code" => 500,"status_message"=>"Internal Server Error","data"=> $responseArray));
			Log::info("changeUserVerification --> Sending of Response Params ".$responseJson);
			return $responseJson;
		}
	}

	public function getAllIdproofsForUser(){
		// if(empty(Auth::user()->id)){
		// 	Log::info("getAllIdproofsForUser --> User Not Logged In.. Please Check");
		// 	$repsonseArray = array("Reason"=>"User Not Logged in");
		// 	$responseJson = json_encode(array("status_code" => 401,"status_message"=>"Unauthorized","data"=> $repsonseArray));
		// 	Log::info("getAllIdproofsForUser --> Sending of Response Params".$responseJson);
		// 	return $responseJson;
		// }
		$userId = Auth::user()->id;
		$objIdProofModel = new IdProofModel();
		$resultData = $objIdProofModel->getAllIdproofs($userId);
		$responseJson = json_encode(array("status_code" => 200,"status_message"=>"Successfull","data"=> $resultData));
		Log::info("getAllIdproofsForUser --> Sending of Response Params".$responseJson);
		return $responseJson;
	}

	public function convertStringToBoolean($value){
		if($value == 'yes'){
			return "1";
		}else{
			return "0";
		}
	}

	public function getDashboardDetails(){
		if(empty(Auth::user()->id)){
			Log::info("getDashboardDetails --> User Not Logged In.. Please Check");
			$responseArray = array("Reason"=>"User Not Logged in");
			$responseJson = json_encode(array("status_code" => 401,"status_message"=>"Unauthorized","data"=> $responseArray));
			Log::info("getDashboardDetails --> Sending of Response Params".$responseJson);
			return $responseJson;
		}
		$objAddressModel = new Addresses();
		$userId = Auth::user()->id;
		$userStatus = Auth::user()->status;
		$userProfileComplete = Auth::user()->is_profile_complete;
		$userType = Auth::user()->user_type;
		$responseArray = array("dashboard_flag"=>"incomplete_profile","username"=>Auth::user()->username,"user_type"=>$userType);
		if(!($userProfileComplete)){
			$responseArray['dashboard_flag'] = "verified_user";//"incomplete_profile";
			$responseJson = json_encode(array("status_code" => 200,"status_message"=>"User Profile Not Complete","data"=>$responseArray));
			Log::info("getDashboardDetails --> Response Params".var_export($responseJson,true));
			return $responseJson;
		}
		if($userStatus == 'unverified'){
			$responseArray['dashboard_flag'] = "unverified_user";
			$responseJson = json_encode(array("status_code" => 200,"status_message"=>"User Profile Not Verified","data"=>$responseArray));
			Log::info("getDashboardDetails --> Response Params".var_export($responseJson,true));
			return $responseJson;
		}
		$responseArray['dashboard_flag'] = "verified_user";
		Log::info("getDashboardDetails --> Value of User Id".$userId);	
		$responseJson = json_encode(array("status_code" => 200,"status_message"=>"Investor Bids On property","data"=>$responseArray));
		Log::info("getDashboardDetails --> Response Params".var_export($responseJson,true));
		return $responseJson;
	}


	public function getResumeDetails(){
		$ratingsValues = array();
		$limitClause = False;
		$input = Input::all();
		if(empty($input))
			$limitClause = True;
		$ratingArray = array();
		Log::info('Params recvd for getResumeDetails '.var_export($input,true));
		if(array_key_exists('min_price', $input)) $minPrice = $input['min_price'];
		if(array_key_exists('max_price', $input)) $maxPrice = $input['max_price'];
		if(array_key_exists('suburb', $input)) $city = $input['suburb'];
		if(array_key_exists('street_name', $input)) $streetName = $input['street_name'];
		if(array_key_exists('street_no', $input)) $streetNo = $input['street_no'];
		if(array_key_exists('state_name', $input)) $state = $input['state_name'];
		if(array_key_exists('country_name', $input)) $state = $input['country_name'];
		if(array_key_exists('property_type', $input)) $propertyType = $input['property_type'];
		if(array_key_exists('borrower_rating', $input)) $ratingArray = $input['borrower_rating'];
		
		// Log::info('Params of rating Data'.var_export($ratingArray,true));
		// if(!empty($ratingArray)){
		// 	foreach($ratingArray as $key => $value){
		// 		if($key == 'APLUS'){
		// 			if($value){
		// 				array_push($ratingsValues,"A+");
		// 			}
		// 		}else{
		// 			if($value){
		// 				array_push($ratingsValues,$key);
		// 			}	
		// 		}
		// 	}
		// }
		$queryString = " select us.email,
							us.id as user_id,
							concat(us.first_name, us.middle_name) as name,
							ph.phone_number,
							jsd.job_category,
							jsd.skill_sets,
							jsd.preferred_location,
							jsd.total_experience,
							jsed.profession,
							concat(at.attachment_path, at.attachment_name) as resume_video
							from attachments at,
							users us,
							phones ph,
							job_seeker_details jsd,
							job_seeker_employment_details jsed
							where us.id = ph.linkable_uid
							and us.id = jsd.linkable_uid
							and us.id = jsed.linkable_uid
							and us.id = at.linkable_cid
							and at.attachment_info = 'resume_video'
							and us.user_type = 'employee' ";

		if( !empty($minPrice) && empty($maxPrice) ){
			$queryString = $queryString . " and phd.pricing >= ".floatval($minPrice) ;
		}

		if( !empty($maxPrice) && empty($minPrice) ){
			$queryString = $queryString . " and phd.pricing <= ".floatval($maxPrice) ;
		}

		if( !empty($maxPrice) && !empty($minPrice) ){
			$queryString = $queryString . " and phd.pricing between ".floatval($minPrice) ." and ". floatval($maxPrice) ;
		}

		if( !empty($city) ){
			$queryString = $queryString . " and ad.suburb = '".strval($city)."'" ;
		}

		if( !empty($streetName) ){
			$queryString = $queryString . " and ad.street_no = '".strval($streetName)."'" ;
		}

		if( !empty($streetNo) ){
			$queryString = $queryString . " and ad.suburb = '".($streetNo)."'" ;
		}

		if( !empty($state) ){
			$queryString = $queryString . " and ad.state_name = '".$state."'" ;
		}

		if( !empty($country) ){
			$queryString = $queryString . " and ad.country_name = '".$country."'" ;
		}

		if( !empty($propertyType) ){
			if($propertyType != 'all'){
				$queryString = $queryString . " and pl.property_type = '".$propertyType."'";
			}
		}

		if( !empty($ratingsValues) ){
			log::info("******Value of ratingsValues".var_export($ratingsValues,true));
			$string = '';
			foreach($ratingsValues as $values){
				$string = $string."'".$values."',";
			}
			$string = rtrim($string, ',');
			log::info("******Value of string".$string);
			$queryString = $queryString . " and us.credit_rating in ($string)";
		}

		$queryString = $queryString . " group by us.email order by us.updated_at desc ";

		if( $limitClause){
			$queryString = $queryString . " limit 4 " ;
		}

		Log::info(" Query String " . $queryString);
		try {
			$resultData = DB::select(DB::raw($queryString));
				if(sizeof($resultData) > 0) {
					Log::info("Size of Result Data  > 0 ");
					$jsonData = array();
					$resultData = json_decode(json_encode($resultData),true);
					// $noOfAuctions = strval(count($resultData));
					// $i = 0;
					// $objImageModel = new ImageModel();
					// foreach($resultData as $row){
					// 	$acutionId =  $row['auction_id'];
					// 	$propertyId =  $row['property_id'];
					// 	$auctiondate = $row['auction_expiry_date'];
					// 	$auctiondate = strtotime($auctiondate);
	 			// 		$currentDate = time();
	 			// 		$dateDiff = ($auctiondate - $currentDate);
     // 					$dateDiff = intval($dateDiff/(60*60*24));
	    //  				log::info("******Value of auctionData".$dateDiff);
	 			// 		$resultData[$i]['no_days_left'] = $dateDiff;
					// 	$objBidModel = new BidModel();
					// 	$bidData = $objBidModel->getAuctionedPropertiesbyId($acutionId);

					// 	$countBidData = count($bidData);
					// 	if(empty($bidData)){
					// 		$resultData[$i]['floating_rate'] = '';
					// 		$resultData[$i]['mark_up_premium'] = '';
					// 		$resultData[$i]['no_bids'] = '0';
					// 		$resultData[$i]['is_accepted'] = 0;
					// 	}else{
					// 		$bidData = $bidData[0];
					// 		$resultData[$i]['floating_rate'] = $bidData['rate_of_interest'];
					// 		$resultData[$i]['mark_up_premium'] = $bidData['mark_up_premium'];
					// 		$resultData[$i]['no_bids'] = $countBidData;
					// 		$resultData[$i]['is_accepted'] = $bidData['is_accepted'];
					// 	}
					// 	$imgageData = $objImageModel->GetImages('property',$propertyId);
					// 	Log::info("getPropertyDetailsById --> Received data for Images ".var_export($imgageData,true));
					// 	if(empty($imgageData)){
					// 		$resultData[$i]['image_details'] = array();
					// 	}else{
					// 		$resultData[$i]['image_details'] = $imgageData;
					// 	}
					// 	$i++;
					// }
					// $jsonData['total_auctions'] = $noOfAuctions;
					// $jsonData['auctioned_prpoerties'] = $resultData;
					// $usersObj = new User();
					// $userData = $usersObj->getUsersCount();
					// foreach($userData as $row){
					// 	$jsonData[$row['user_type']."_count"] = $row['user_count'];
					// }
					$responseJson = json_encode(array("status_code" => 200,"status_message"=>"success","data"=>$resultData));
				}else{
					Log::info("Size of Result Data  < 0 ");
					$responseJson = json_encode(array("status_code" => 404,"status_message"=>"No records","data"=>array()));
				}
		}catch(Exception $e){
			Log::error('There was some problem while executing Query getFilterAuctions');
			$responseJson = json_encode(array("status_code" => 500,"status_message"=>"Internal Server Error","data"=>$e->getMessage()));
		}
		Log::info('Json Response sent getFilterAuctions '.var_export($responseJson,true));
		return $responseJson;
	} // end of function 


	public function getuserDataById(){
		if(empty(Auth::user()->id)){
			Log::info("getuserDataById --> User Not Logged In.. Please Check");
			$repsonseArray = array("Reason"=>"User Not Logged in");
			$responseJson = json_encode(array("status_code" => 401,"status_message"=>"Unauthorized","data"=> $repsonseArray));
			Log::info("getuserDataById --> Sending of Response Params ".$responseJson);
			return $responseJson;
		}
		if(Auth::user()->user_type != 'employer'){
			Log::info("getuserDataById --> Logged In User Not type Employer.. Please Check");
			$repsonseArray = array("Reason"=>"Logged In User Not type Employer");
			$responseJson = json_encode(array("status_code" => 401,"status_message"=>"Unauthorized","data"=> $repsonseArray));
			Log::info("getuserDataById --> Sending of Response Params".$responseJson);
			return $responseJson;
		}
		$input = Input::all();
		Log::info("getuserDataById --> value of Params Recvd ".var_export($input,true));
		$rules = array(
						'user_id' => 'Required'
					);
		$v = Validator::make($input, $rules);
		if($v->fails()){
			$failureData = $v->messages();
			Log::info("getuserDataById--> Validation Failure".var_export($failureData,true));
			$responseJson = json_encode(array("status_code" => 400,"status_message"=>"Validation Failure","data"=>array("Reason"=>"Validation Failure")));
			Log::info("getuserDataById--> Sending of Response Params  ".$responseJson);
			return $responseJson;
		}
		try{
			$userId = $input['user_id'];
			$objAddresses = new Addresses();
			$objPhones = new Phones();
			$objJobSeekerDetails = new JobSeekerDetails();
			$objJobSeekerEmploymentDetails = new JobSeekerEmploymentDetails();
			$objJobSeekerEducationDetails = new JobSeekerEducationDetails();
			$objJobSeekerProjectDetails = new JobSeekerProjectDetails();
			$objAttachments =  new Attachments();

			$responseData = array();
			$userData = $this->getUserData();
			if(empty($userData)){
				$responseData['user_details'] = array();
			}else{
				$responseData['user_details'] = $userData;
			}

			$addressData = $objAddresses->getAddressDetailsByUserId($userId);
			if(empty($addressData)){
				$responseData['address'] = array();
			}else{
				$addressData = $addressData[0];
				$responseData['address'] = $addressData;
			}

			$phoneData = $objPhones->getContactDetailsByUserId($userId);
			if(empty($phoneData)){
				$responseData['phones'] = array();
			}else{
				$phoneData = $phoneData[0];
				$responseData['phones'] = $phoneData;
			}

			$jobData = $objJobSeekerDetails->getJobSeekerDetailsByUserId($userId);
			if(empty($jobData)){
				$jobData['jobseeker'] = array();
			}else{
				$jobData = $jobData[0];
				$relocateFlag = 'No';
				if($jobData['is_relocate'])
					$relocateFlag = 'Yes';
				$jobData['is_relocate'] = $relocateFlag;
				$responseData['jobseeker'] = $jobData;
			}

			$currentEmpData = $objJobSeekerEmploymentDetails->getEmploymentDetailsByUserId($userId,'current');
			if(empty($currentEmpData)){
				$responseData['currentemp'] = array();
			}else{
				$currentEmpData = $currentEmpData[0];
				$responseData['currentemp'] = $currentEmpData;
			}

			$priorEmpData = $objJobSeekerEmploymentDetails->getEmploymentDetailsByUserId($userId,'prior');
			if(empty($priorEmpData)){
				$responseData['prioremp'] = array();
			}else{
				$responseData['prioremp'] = $priorEmpData;
			}

			$educationData = $objJobSeekerEducationDetails->getEducationDetailsforUser($userId);
			if(empty($educationData)){
				$responseData['education'] = array();
			}else{
				$educationData = $educationData[0];
				$responseData['education'] = $educationData;
			}

			$projectData = $objJobSeekerProjectDetails->getProjectDetailsByUserId($userId);
			if(empty($projectData)){
				$responseData['project'] = array();
			}else{
				$projectData = $projectData[0];
				$responseData['project'] = $projectData;
			}

			$videoResume = $objAttachments->GetAttachments($userId,'resume_video');
			if(empty($videoResume)){
				$responseData['videoresume'] = array();
			}else{
				$videoResume = $videoResume[0];
				$responseData['videoresume'] = $videoResume['attachment_path'].$videoResume['attachment_name'];
			}
			$responseJson = json_encode(array("status_code" => 200,"status_message"=>"Success","data"=> $responseData));
			Log::info("getPropertyDetailsById --> Sending of Response Params getPropertyDetailsById ".$responseJson);
			return $responseJson;
		}catch(Exception $e){
			Log::error("getuserDataById --> There was some Error".$e->getMessage());
			$responseJson = json_encode(array("status_code" => 500,"status_message"=>"Internal Server Error","data"=>array("Reason"=>'Internal Server Error')));
			Log::info("getuserDataById --> Sending of Response Params getPropertyDetailsById ".$responseJson);
			return $responseJson;
		}
	} // end of function 

	public function getUserDetails($userId){	
		$userObj = new User();
		$addressObj = new Addresses();
		$phoneObj = new Phones();
		$jobSeekerObj = new JobSeekerDetails();
		$jobSeekerEmpObj = new JobSeekerEmploymentDetails();
		$jobSeekerEduObj = new JobSeekerEducationDetails();
		$jobSeekerProj = new JobSeekerProjectDetails();
		$attachmentObj = new Attachments();
		$data = array();
		$userType = $userObj::find($userId)->user_type;
		Log::info("getUserDetails --> Sending of Response Params myAccount ".var_export($userType,true));
		if(empty($userType)){
			return array();
		}
		$basicData = $userObj->getBasicDetailsByUserId($userId);
		if(empty($basicData)){
			return array();
		}
		$data['user_type'] = $basicData[0]->user_type;
		if($userType == 'employee'){
			/* employee basic Details */
			$data['personal']['title'] = $basicData[0]->title;
			$data['personal']['first_name'] = $basicData[0]->first_name;
			$data['personal']['middle_name'] = $basicData[0]->middle_name;
			$data['personal']['last_name'] = $basicData[0]->last_name;
			$data['personal']['dob'] = $basicData[0]->dob;
			/* employee basic Details Ends*/

			/* employee Address Details */
			Log::info("getUserDetails --> value of User Id".$userId);
			$addressData = $addressObj->getAddressDetailsByUserId($userId);
			if(empty($addressData)){
				$data['personal']['address'] = array();
			}else{
				$data['personal']['address'] = $addressData[0];
			}
			/* employee Address Details Ends */

			/* employee Phone Details */
			$phoneData = $phoneObj->getContactDetailsByUserId($userId);
			if(empty($phoneData)){
				$data['personal']['phone'] = array();
			}else{
				$phoneData = json_decode(json_encode($phoneData),true);
				foreach ($phoneData as $key => $value) {
					if($value['phone_type'] == 'work'){
					$data['personal']['phone']['work']['phone_city_code'] = $value['phone_city_code'];
					$data['personal']['phone']['work']['phone_number'] = $value['phone_number'];
					}
					if($value['phone_type'] == 'mobile'){
					$data['personal']['phone']['mobile']['phone_city_code'] = $value['phone_city_code'];
					$data['personal']['phone']['mobile']['phone_number'] = $value['phone_number'];
					}
					if ($value['phone_type'] == 'home'){
					$data['personal']['phone']['home']['phone_city_code'] = $value['phone_city_code'];
					$data['personal']['phone']['home']['phone_number'] = $value['phone_number'];
					}
				}
			}
			/* employee Phone Details Ends*/

			/* employee Attachment Details */

			// $attachmentData = $attachmentsObj->GetMessageAttachments('user', $userId,'id_proof');
			// if(empty($attachmentData)){
			// 	$data['personal']['idproof'] = array();
			// }else{
			// 	$data['personal']['idproof'] = $attachmentData;
			// }

			/* Borrower 1 Attachment Details Ends */

			/* employee jobSeeker Details */

			$jobSeekerData = $jobSeekerObj->getJobSeekerDetailsByUserId($userId);
			if(empty($jobSeekerData)){
				$data['loan'] = array();
			}else{
				$data['loan'] = $loanData[0];
			}

			/* employee jobSeeker Details End*/

			/* employee Employment Details*/

			$currEmpData = $jobSeekerEmpObj->getEmploymentDetailsByUserId($userId, 'current');
			if(empty($currEmpData)){
				$data['loan']['current_employment'] = array();
			}else{
				$data['loan']['current_employment'] = $currEmpData[0];
			}

			$prevEmpData = $jobSeekerEmpObj->getEmploymentDetailsByUserId($userId, 'prior');
			if(empty($prevEmpData)){
				$data['loan']['previous_employments'] = array();
			}else{
				$data['loan']['previous_employments'] = $prevEmpData;
			}

			/* employee Educational Details End*/

			$class_10_details = $jobSeekerEduObj->getEducationDetailsByUserId($userId, 'class_10');
			if(empty($class_10_details)){
				$data['financial']['class_10_details'] = array();
			}else{
				$data['financial']['class_10_details'] = $class_10_details[0];
			}

			$class_12_details = $jobSeekerEduObj->getEducationDetailsByUserId($userId, 'class_12');
			if(empty($class_12_details)){
				$data['financial']['class_10_details'] = array();
			}else{
				$data['financial']['class_10_details'] = $class_12_details[0];
			}

			$class_deg_details = $jobSeekerEduObj->getEducationDetailsByUserId($userId, 'b_degree');
			if(empty($class_deg_details)){
				$data['financial']['class_10_details'] = array();
			}else{
				$data['financial']['class_10_details'] = $class_deg_details[0];
			}
			/* employee Educational Details End*/

			$projectDetails = $jobSeekerProj->getProjectDetailsByUserId($userId);
			if(empty($projectDetails)){
				$data['financial']['project_details'] = array();
			}else{
				$data['financial']['project_details'] = $class_deg_details[0];
			}
		}else if($userType =='employer'){
			Log::info("getUserAccountDetails --> coming inside Investor");
			$data['oneStepRegistration']['title'] = $basicData[0]->title;
			$data['oneStepRegistration']['first_name'] = $basicData[0]->first_name;
			$data['oneStepRegistration']['middle_name'] = $basicData[0]->middle_name;
			$data['oneStepRegistration']['last_name'] = $basicData[0]->last_name;
			$data['oneStepRegistration']['dob'] = $basicData[0]->dob;
			$data['oneStepRegistration']['email'] = $basicData[0]->email;
			$addressData = $addressObj->getAddressDetailsByUserId($userId);
			if(empty($addressData)){
				$data['oneStepRegistration']['address'] = array();
			}else{
				$data['oneStepRegistration']['address'] = $addressData[0];
			}
			$phoneData = $phoneObj->getContactDetailsByUserId($userId);
			if(empty($phoneData)){
				$data['oneStepRegistration']['phone'] = array();
			}else{
				$data['oneStepRegistration']['phone'] = $phoneData;
			}
			$bankDetailsObj = new BankDetailsModel();
			$bankData = $bankDetailsObj->getBankDetailsByUserId($userId);
			if(empty($bankData)){
				$data['oneStepRegistration']['bankdetail'] = array();
			}
			else{
				$data['oneStepRegistration']['bankdetail'] = $bankData[0];
			}
		}

		return $data;
	}


	public static function getUserAccountDetailsById($userId){
		$userObj = new User();
		$addressObj = new Addresses();
		$phoneObj = new Phones();
		$jobSeekerObj = new JobSeekerDetails();
		$jobSeekerEmpObj = new JobSeekerEmploymentDetails();
		$jobSeekerEduObj = new JobSeekerEducationDetails();
		$jobSeekerProj = new JobSeekerProjectDetails();
		$attachmentObj = new Attachments();
		$data = array();
		$userType = $userObj::find($userId)->user_type;
		Log::info("getUserAccountDetailsById --> Sending of Response Params myAccount ".var_export($userType,true));
		if(empty($userType)){
			return array();
		}
		$basicData = $userObj->getBasicDetailsByUserId($userId);
		if(empty($basicData)){
			return array();
		}
		$data['user_type'] = $basicData[0]->user_type;
		//$data['profile_status'] = $basicData[0]->profile_status;
		$data['email'] = $basicData[0]->email;
		if($userType == 'employee'){
			$data['personal']['title'] = $basicData[0]->title;
			$data['personal']['first_name'] = $basicData[0]->first_name;
			$data['personal']['middle_name'] = $basicData[0]->middle_name;
			$data['personal']['last_name'] = $basicData[0]->last_name;
			$dob = '';
			if(!empty($basicData[0]->dob)){
				$dob = date('m/d/Y',strtotime($basicData[0]->dob));
			}
			$data['personal']['dob'] = $dob;
			Log::info("getUserAccountDetailsById --> value of User Id".$userId);
			$addressData = $addressObj->getAddressDetailsByUserId($userId);
			if(empty($addressData)){
				$data['personal']['address']['street_no'] = '';
				$data['personal']['address']['street_name'] = '';
				$data['personal']['address']['suburb'] = '';
				$data['personal']['address']['postcode'] = '';
				$data['personal']['address']['city_name'] = '';
				$data['personal']['address']['state_name'] = '';
			}else{
				$data['personal']['address'] = $addressData[0];
			}
			$phoneData = $phoneObj->getContactDetailsByUserId($userId);
			if(empty($phoneData)){
				$data['personal']['phone']['work']['phone_city_code'] = '';
				$data['personal']['phone']['work']['phone_number'] = '';
				$data['personal']['phone']['mobile']['phone_city_code'] = '';
				$data['personal']['phone']['mobile']['phone_number'] = '';
				$data['personal']['phone']['home']['phone_city_code'] = '';
				$data['personal']['phone']['home']['phone_number'] = '';
			}else{
				$phoneData = json_decode(json_encode($phoneData),true);
				foreach ($phoneData as $key => $value) {
					if($value['phone_type'] == 'work'){
						$data['personal']['phone']['work']['phone_city_code'] = $value['phone_city_code'];
						$data['personal']['phone']['work']['phone_number'] = $value['phone_number'];
					}
					if($value['phone_type'] == 'mobile'){
						$data['personal']['phone']['mobile']['phone_city_code'] = $value['phone_city_code'];
						$data['personal']['phone']['mobile']['phone_number'] = $value['phone_number'];
					}
					if ($value['phone_type'] == 'home'){
						$data['personal']['phone']['home']['phone_city_code'] = $value['phone_city_code'];
						$data['personal']['phone']['home']['phone_number'] = $value['phone_number'];
					}
				}
			}
			
			$jobSeekerData = $jobSeekerObj->getJobSeekerDetailsByUserId($userId);
			if(empty($jobSeekerData)){
				$data['loan']['resume_headline'] = '';
				$data['loan']['job_category'] = '';
				$data['loan']['skill_sets'] = '';
				$data['loan']['preferred_location'] = '';
				$data['loan']['is_relocate'] = '';
				$data['loan']['total_experience'] = '';
				$data['loan']['comments'] = '';
			}else{
				$jobSeekerData = $jobSeekerData[0];
				$data['loan']['resume_headline'] = $jobSeekerData['resume_headline'];
				$data['loan']['job_category'] = $jobSeekerData['job_category'];
				$data['loan']['skill_sets'] = $jobSeekerData['skill_sets'];
				$data['loan']['is_relocate'] = $jobSeekerData['is_relocate'];
				$data['loan']['total_experience'] = $jobSeekerData['total_experience'];
			}
			
			$currEmpData = $jobSeekerEmpObj->getEmploymentDetailsByUserId($userId, 'current');
			if(empty($currEmpData)){
				$data['loan']['current_employment']['yearly_salary'] = '';
				$data['loan']['current_employment']['basis_of_employment'] = '';
				$data['loan']['current_employment']['profession'] = '';
				$data['loan']['current_employment']['industry'] = '';
				$data['loan']['current_employment']['employment_period_years'] = '';
				$data['loan']['current_employment']['employment_period_months'] = '';
				$data['loan']['current_employment']['functional_area'] = '';
				$data['loan']['current_employment']['employment_role'] = '';
			}else{
				$data['loan']['employment'] = $currEmpData[0];
			}

			$prevEmpData = $jobSeekerEmpObj->getEmploymentDetailsByUserId($userId, 'prior');
			if(empty($prevEmpData)){
				$data['loan']['previous_employments']["yearly_salary"] =  "";
				$data['loan']['previous_employments']["basis_of_employment"] =  "";
				$data['loan']['previous_employments']["profession"] =  "";
				$data['loan']['previous_employments']["industry"] = "";
				$data['loan']['previous_employments']["employment_period_years"] =  "";
				$data['loan']['previous_employments']["employment_period_months"] =  "";
				$data['loan']['previous_employments']['functional_area'] = '';
				$data['loan']['previous_employments']['employment_role'] = '';
			}else{
				$data['loan']['previous_employments'] = $prevEmpData;
			}
			$data['no_of_applicants'] = 1;

			$class_10_details = $jobSeekerEduObj->getEducationDetailsByUserId($userId, 'class_10');
			if(empty($class_10_details)){
				$data['financial']['class_10_details']['year_of_passing'] = '';
				$data['financial']['class_10_details']['school_name'] = '';
				$data['financial']['class_10_details']['passing_percentage'] = '';
				$data['financial']['class_10_details']['basis_of_education'] = '';
			}else{
				$data['financial']['class_10_details'] = $class_10_details[0];
			}

			$class_12_details = $jobSeekerEduObj->getEducationDetailsByUserId($userId, 'class_12');
			if(empty($class_12_details)){
				$data['financial']['class_12_details']['year_of_passing'] = '';
				$data['financial']['class_12_details']['school_name'] = '';
				$data['financial']['class_12_details']['passing_percentage'] = '';
				$data['financial']['class_12_details']['basis_of_education'] = '';
			}else{
				$data['financial']['class_12_details'] = $class_12_details[0];
			}

			$class_deg_details = $jobSeekerEduObj->getEducationDetailsByUserId($userId, 'b_degree');
			if(empty($class_deg_details)){
				$data['financial']['b_degree_details']['year_of_passing'] = '';
				$data['financial']['b_degree_details']['school_name'] = '';
				$data['financial']['b_degree_details']['passing_percentage'] = '';
				$data['financial']['b_degree_details']['basis_of_education'] = '';
			}else{
				$data['financial']['b_degree_details'] = $class_deg_details[0];
			}

			/* employee Educational Details End*/

			$projectDetails = $jobSeekerProj->getProjectDetailsByUserId($userId);
			if(empty($projectDetails)){
				$data['financial']['project_details']['project_name'] = '';
				$data['financial']['project_details']['project_description'] = '';
				$data['financial']['project_details']['project_link'] = '';
			}else{
				$data['financial']['project_details'] = $class_deg_details[0];
			}
		}else if($userType =='investor'){
			Log::info("getUserAccountDetails --> coming inside Investor");
			$data['oneStepRegistration']['title'] = $basicData[0]->title;
			$data['oneStepRegistration']['first_name'] = $basicData[0]->first_name;
			$data['oneStepRegistration']['middle_name'] = $basicData[0]->middle_name;
			$data['oneStepRegistration']['last_name'] = $basicData[0]->last_name;
			$data['oneStepRegistration']['dob'] = $basicData[0]->dob;
			$data['oneStepRegistration']['email'] = $basicData[0]->email;
			$addressData = $addressObj->getAddressDetailsByUserId($userId);
			if(empty($addressData)){
				$data['oneStepRegistration']['address'] = array();
			}else{
				$data['oneStepRegistration']['address'] = $addressData[0];
			}
			$phoneData = $phoneObj->getContactDetailsByUserId($userId);
			if(empty($phoneData)){
				$data['oneStepRegistration']['phone'] = array();
			}else{
				$data['oneStepRegistration']['phone'] = $phoneData;
			}
			$bankDetailsObj = new BankDetailsModel();
			$bankData = $bankDetailsObj->getBankDetailsByUserId($userId);
			if(empty($bankData)){
				$data['oneStepRegistration']['bankdetail'] = array();
			}
			else{
				$data['oneStepRegistration']['bankdetail'] = $bankData[0];
			}
		}

		return $data;
	}

	public function postJob(){
		if(empty(Auth::user()->id)){
   			Log::info("postJob -->User Not Logged In.. Please Check");
   			$repsonseArray = array("Reason"=>"User Not Logged in");
   			$responseJson = json_encode(array("status_code" => 401,"status_message"=>"Unauthorized","data"=> $repsonseArray));
   			Log::info("postJob -->Sending of Response Params postLoanDetails ".$responseJson);
			return $responseJson;
  		}
  		$input = Input::all();
  		Log::info("postJob -->value of Params Recvd postJobSeekerDetails ".var_export($input,true));

  		$rules = array(	'job_type' =>'Required',
						'job_description' =>'Required',
						'job_designation' =>'Required',
						'min_exp_level' =>'Required',
						'max_exp_level' =>'Required',
						'min_salary_range' =>'Required',
						'max_salary_range' =>'Required',
						'job_requirement' => 'Required',
						'job_industry' => 'Required'
					);
		$v = Validator::make($input, $rules);
		if($v->fails()){
			Log::error("postJob -->There was some Validation Failures");
			$validationFailure = $v->messages();
			$validationFailure = json_decode($validationFailure,true);
			Log::error("postJob -->There was some Validation Failures postJobSeekerDetails: ".var_export($validationFailure,true));
			foreach($validationFailure as $row){
				$validationFailure = $row;
			}
			$responseJson = json_encode(array("status_code" => 400,"status_message"=>"Validation Failure","data"=>array("Reason"=>$validationFailure)));
			Log::info("postJob -->Sending of Response Params".$responseJson);
			return $responseJson;
		}
		try{
			$input['linkable_uid'] = Auth::user()->id;
			$input['email_id'] = Auth::user()->email;
			$objJobPosting = new JobPostings();
			$result = $objJobPosting->addprojectDetails($input);
			Log::info("postJob -->Succesfully Saved postJob Details");
			$responseJson = json_encode(array("status_code" => 200,"status_message"=>"Succesfully Registered","data"=> array("Reason"=>"Successfully posted a Job")));
			Log::info("postJob --> Sending of Response Params ".$responseJson);
			return $responseJson;
		}catch(Exception $e){
			Log::error("There was some Error".$e->getMessage());
			$responseJson = json_encode(array("status_code" => 500,"status_message"=>"Internal Server Error","data"=>array("Reason"=>$e->getMessage())));
			Log::info("postJob --> Sending of Response Params ".$responseJson);
			return $responseJson;
		}

	}


	public function getPostedJobs(){
		
		$limitClause = False;
		$input = Input::all();
		if(empty($input))
			$limitClause = True;
		$ratingArray = array();
		Log::info('getPostedJobs -->Params recvd for '.var_export($input,true));
		
		$queryString = " select * from job_postings ";
		$queryString = $queryString . " order by created_at desc ";

		if( $limitClause ){
			$queryString = $queryString . " limit 4 " ;
		}
		Log::info("getPostedJobs--> Query String " . $queryString);
		try {
				$resultData = DB::select(DB::raw($queryString));
				if(sizeof($resultData) > 0) {
					Log::info("getPostedJobs --> Size of Result Data  > 0 ");
					$jsonData = json_decode(json_encode($resultData),true);
					$responseJson = json_encode(array("status_code" => 200,"status_message"=>"success","data"=>$jsonData));
				}else{
					Log::info("getPostedJobs --> Size of Result Data  < 0 ");
					$responseJson = json_encode(array("status_code" => 404,"status_message"=>"No records","data"=>array()));
				}
		}catch(Exception $e){
			Log::error('There was some problem while executing Query getPostedJobs');
			$responseJson = json_encode(array("status_code" => 500,"status_message"=>"Internal Server Error","data"=>$e->getMessage()));
		}
		Log::info('Json Response sent getPostedJobs '.var_export($responseJson,true));
		return $responseJson;
	} // end of function 
	/* getPostedJobs */ 

} // end of class