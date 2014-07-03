<?php

class Images extends Eloquent{

	protected $table = 'images';

	public function addImage($data){
		$res = $this->GetImages($data['image_type'],$data['user_id']);
		if(empty($res)){
			$id = DB::table('images')->insertGetId(array(
							'linkable_cid' => $data['user_id'],
							'image_type' => $data['image_type'],
							'image_name' => $data['image_name'],
							'image_path' => $data['image_path'],
							'created_at'=>date('Y-m-d H:i:s'),
							'updated_at'=>date('Y-m-d H:i:s'),
							'created_by'=>$data['email_id'],
							'updated_by'=>$data['email_id']
					  	));
			return $id;
		}else {
			$id = DB::table('images')
					->where('linkable_cid', $data['user_id'])
					->update(array(
							'image_type' => $data['image_type'],
							'image_name' => $data['image_name'],
							'image_path'=>$data['image_path'],
							'updated_at'=>date('Y-m-d H:i:s'),
							'updated_by'=>$data['email_id']
						));
			return $id;	
		}
	}

	public function GetImages($imageType,$linkableCid){
		$result = DB::table('images')
						->select('image_name','image_path')
						->where('is_deleted', 0)
						->where('image_type', $imageType)
						->where('linkable_cid', $linkableCid)
						->get();
		return json_decode(json_encode($result),true);
	}
	
} // end of class