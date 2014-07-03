<?php

class JobSeekerProjectDetails extends Eloquent{

	protected $table = 'job_seeker_project_details';
	
	public function addprojectDetails($data){
		
		$id = DB::table('job_seeker_project_details')->insertGetId(array(
							'linkable_uid' => $data['user_id'],
							'project_name' => $data['project_name'],
							'project_details' => $data['project_details'],
							'project_link' => $data['project_link'],
							'updated_at'=>date('Y-m-d H:i:s'),
							'created_by'=>$data['email_id'],
							'updated_by'=>$data['email_id']
					  	));
		return $id;
	}

	public function getProjectDetailsByUserId($userId){
		$result = DB::table('job_seeker_project_details')
					->where('linkable_uid', $userId)
					->where('status', 'active')
					->get();
		return json_decode(json_encode($result),true);
	}
	
} // end of class