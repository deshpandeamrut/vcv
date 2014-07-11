<?php

class JobSeekerEducationDetails extends Eloquent{

	protected $table = 'job_seeker_education_details';

	public function addeducationDetails($data){

	  	$id = DB::table('job_seeker_education_details')->insertGetId(array(
	  						'linkable_uid' => $data['user_id'],
							'basis_of_education' => $data['basis_of_education'],
							'year_of_passing' => $data['year_of_passing'],
							'school_name' => $data['school_name'],
							'passing_percentage' => $data['passing_percentage'],
							'updated_at'=>date('Y-m-d H:i:s'),
							'created_by'=>$data['email_id'],
							'updated_by'=>$data['email_id']
					  	));
		return $id;
	} // end of functions educationDetails

	public function getEducationDetailsByUserId($userId,$eduClass){
		$result = DB::table('job_seeker_education_details')
					->where('linkable_uid', $userId)
					->where('basis_of_education', $eduClass)
					->where('status', 'active')
					->get();
		return json_decode(json_encode($result),true);
	}
} // end of class