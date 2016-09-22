<?php
/**
 * Created by Marcin Galaszewski.
 * User: Marcin Galaszewski
 * Date: 2015-04-14
 * Time: 11:06
 */

namespace Controllers\Files;

use BaseController;
use Input;
use Response;
use Validator;
use Str;
use Upload;
use File;
use Config;
use Hash;
use Sentry;

class FilesController extends BaseController {

    public function store(){
        if ($file = Input::file('file'))
        {
            $uploadable_type = strtolower(Input::get('action'));
            switch ($uploadable_type) {
                case 'task':
                    $fileConfigSize = Config::get('config.file.doc.size');
                    $extension_restrictions = Config::get('config.file.doc_img.extensions');
                    break;
                case 'campaign':
                case 'company':
                case 'job':
                case 'potential':
                case 'user':
                default:
                    $fileConfigSize = Config::get('config.file.doc.size');
                    $extension_restrictions = Config::get('config.file.doc.extensions');
                    break;
            }

            $path = Config::get('config.paths.upload.' . $uploadable_type);
            $uploadable_type = ucfirst($uploadable_type);
            $file = Input::file('file');
            $campaignId = Input::get('id');
            $extension = $file->getClientOriginalExtension();
            $size = $file->getSize();
            if($size <= $fileConfigSize && 1 < $size) {
                if(in_array(Str::lower($extension), $extension_restrictions)) {
                    $micTime = microtime(true);
                    $microSec = sprintf("%06d",($micTime - floor($micTime)) * 1000000);
                    $hash_name = md5(date("Y-m-d-H:i:s." . $microSec)); // create unique file name and secured this name
                    $name = $file->getClientOriginalName();
                    try{
                        if(!File::exists(Config::get('config.paths.upload.upload'))) { // if direction doesn't exist then create it
                            File::makeDirectory(Config::get('config.paths.upload.upload'), 0775);
                        }
                        $result = $file->move($path . $campaignId, $hash_name . '.' . $extension);
                        if($result) {
                            $file = new Upload;
                            $file->uploadable_id   = $campaignId;
                            $file->uploadable_type = $uploadable_type;
                            $file->user_id         = Sentry::getUser()->id;
                            $file->name            = $name;
                            $file->hash_name       = $hash_name . '.' . $extension;
                            $file->upload_url      = $path . $campaignId . '\\';
                            $file->extension       = $extension;
                            $file->size            = $size;
                            if($file->save()) {
                                return Response::json(['data' => $file->toArray(), 'alert' => ['type' => 'success', 'message' => ['Files has been uploaded successfully.']]]);
                            }
                        }
                    } catch (\Exception $e) {
                        return Response::json(['alert' => ['type' => 'danger', 'message' => ['Please contact with you administrator or try again.']]]);
                    }
                } else {
                    return Response::json(['alert' => ['type' => 'danger', 'message' => ['Wrong file extension.']]]);
                }
            } else {
                return Response::json(['alert' => ['type' => 'danger', 'message' => ['Wrong file size.']]]);
            }
        }
    }

    public function destroy($uploadId)
    {
        try{
            $file = Upload::find($uploadId);
            Upload::destroy($uploadId);
            File::delete($file->upload_url . $file->hash_name);

            if(count(File::allFiles($file->upload_url)) == 0) { // if folder is empty remove folder as well
                File::deleteDirectory($file->upload_url);
            }
        } catch (\Exception $e) {
            return Response::json(['alert' => ['type' => 'danger', 'message' => ['Please contact with you administrator or try again.']]]);
        }
        return Response::json(['alert' => ['type' => 'success', 'message' => ['File has been removed successfully.']]]);
    }

    public function show($uploadId) {
        $file = Upload::find($uploadId);

        try{
            $pdf_base64 = $file->upload_url . $file->hash_name;
            $pdf_base64_handler = fopen($pdf_base64,'r'); //Get File content from txt file
            $pdf_content = fread ($pdf_base64_handler,filesize($pdf_base64));
            fclose ($pdf_base64_handler);
        } catch (\Exception $e) {
            return Response::json(['alert' => ['type' => 'danger', 'message' => ['Please contact with you administrator or try again.']]]);
        }

        //Decode pdf content
        return base64_encode($pdf_content);
    }

    public function index(){}
    public function create(){}
    public function view($id){}
    public function edit($id){}
    public function update($id){}
}
