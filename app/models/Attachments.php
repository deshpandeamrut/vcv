<?php

class Attachments extends Eloquent{

	protected $table = 'attachments';

	public function addAttachment($data){

		$id = DB::table('attachments')->insertGetId(array(
			'linkable_cid' => $data['user_id'],
			'attachment_name' => $data['attachment_name'],
			'attachment_type' => $data['attachment_type'],
			'attachment_info' => $data['attachment_info'],
			'attachment_usage' => $data['attachment_usage'],
			'attachment_path' => $data['attachment_path'],
			'created_by'=>date('Y-m-d H:i:s'), 
			'updated_at'=>date('Y-m-d H:i:s'),
			'created_by'=>$data['email_id'],
			'updated_by'=>$data['email_id']
		));

		return $id;              
	}

	public function GetAttachments($linkableCid,$attachmentInfo){
		$result = DB::table('attachments')
						->select(
								 'attachment_name',
								 'attachment_path'
								)
						->where('is_deleted', 0)
						->where('attachment_info', $attachmentInfo)
						->where('linkable_cid', $linkableCid)
						->get();
		return json_decode(json_encode($result),true);
	}
} // end of class