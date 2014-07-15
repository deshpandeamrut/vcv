<?php

class JobPostings extends Eloquent{

	protected $table = 'job_postings';
	
	public function addprojectDetails($data){


		$id = DB::table('job_postings')->insertGetId(array(
							'linkable_uid' => $data['linkable_uid'],
							'job_type' => $data['job_type'],
							'job_industry' => $data['job_industry'],
							'job_description' => $data['job_description'],
							'job_designation' => $data['job_designation'],
							'min_exp_level' => $data['min_exp_level'],
							'max_exp_level' => $data['max_exp_level'],
							'min_salary_range' => $data['min_salary_range'],
							'max_salary_range' => $data['max_salary_range'],
							'company_name' => $data['company_name'],
							'company_logo' => $data['company_logo'],
							'link_to_compnay' => $data['link_to_compnay'],
							'company_description' => $data['company_description'],
							'job_requirement' => $data['job_requirement'],
							'updated_at'=>date('Y-m-d H:i:s'),
							'created_by'=>$data['email_id'],
							'updated_by'=>$data['email_id']
					  	));
		return $id;
	}

	public function getProjectDetailsByUserId($userId){
		$result = DB::table('job_postings')
					->where('linkable_uid', $userId)
					->where('status', 'active')
					->get();
		return json_decode(json_encode($result),true);
	}
	
} // end of class