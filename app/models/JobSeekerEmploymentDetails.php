<?php

class JobSeekerEmploymentDetails extends Eloquent{

	protected $table = 'job_seeker_employment_details';

	public function addemployementDetails($data){
		
			if( array_key_exists('employment_period_years', $data) && array_key_exists('employment_period_months', $data))
				$employmentPeriod = $data['employment_period_years'].$data['employment_period_months'];
			
			$id = DB::table('job_seeker_employment_details')->insertGetId(array(
							'linkable_uid' => $data['user_id'],
							'employment_type' => $data['employment_type'],
							'employment_status' => $data['basis_of_employment'],
							'yearly_salary' => $data['yearly_salary'],
							'profession'=>$data['profession'],
							'industry' =>$data['industry'],
							'functional_area' =>$data['functional_area'],
							'employment_period' =>$employmentPeriod,
							'employment_role'=>$data['employment_role'],
							'updated_at'=>date('Y-m-d H:i:s'),
							'created_by'=>$data['email_id'],
							'updated_by'=>$data['email_id']
					  	));
		return $id;
	}	

	public function getEmploymentDetailsByUserId($userId,$empType){
		$result = DB::table('job_seeker_employment_details')
					->where('linkable_uid', $userId)
					->where('employment_type', $empType)
					->get();
		return json_decode(json_encode($result),true);
	}
} // end of class