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

    public function index(){}
    public function create(){}

    /**
     * Stores a new file depends on model
     * @return mixed
     */
    public function store(){
        if ($file = Input::file('file'))
        {
            $uploadable_type = strtolower(Input::get('action'));
            // select model for which we save file
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

            // check if file size is correct
            if($size <= $fileConfigSize && 1 < $size) {

                // check if file's extension is correct
                if(in_array(Str::lower($extension), $extension_restrictions)) {
                    $micTime = microtime(true);
                    $microSec = sprintf("%06d",($micTime - floor($micTime)) * 1000000);

                    // create unique file name and secured this name
                    $hash_name = md5(date("Y-m-d-H:i:s." . $microSec));

                    // get original file name
                    $name = $file->getClientOriginalName();
                    try{
                        // if direction doesn't exist then create it
                        if(!File::exists(Config::get('config.paths.upload.upload'))) {
                            File::makeDirectory(Config::get('config.paths.upload.upload'), 0775);
                        }

                        // paste this file into the direction
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

    /**
     * Return a file with the given file if
     * @param $uploadId id of thi file
     * @return mixed is binary code of this file which is decoded in mime base64
     */
    public function show($uploadId) {
        $file = Upload::find($uploadId);

        try{
            // get file direction and hash name from db
            $file_base = $file->upload_url . $file->hash_name;

            // get File content from txt file
            $pdf_base_handler = fopen($file_base,'r');

            // open and get file in binary format
            $file_content = fread ($pdf_base_handler,filesize($file_base));

            // close file
            fclose ($pdf_base_handler);
        } catch (\Exception $e) {
            return Response::json(['alert' => ['type' => 'danger', 'message' => ['Please contact with you administrator or try again.']]]);
        }

        // return decoded file content with mime base64
        return base64_encode($file_content);
    }

    public function edit($id){}
    public function update($id){}

    /**
     * Delete file from database and also from server
     * @param $uploadId if of file to delete
     * @return mixed
     */
    public function destroy($uploadId)
    {
        try{
            $file = Upload::find($uploadId);

            // delete file from database
            Upload::destroy($uploadId);

            // remove file from server
            File::delete($file->upload_url . $file->hash_name);

            // if folder is empty remove folder as well
            if(count(File::allFiles($file->upload_url)) == 0) {
                File::deleteDirectory($file->upload_url);
            }
        } catch (\Exception $e) {
            return Response::json(['data' => $file->toArray(), 'alert' => ['type' => 'danger', 'message' => ['Please contact with you administrator or try again.']]]);
        }
        return Response::json(['alert' => ['type' => 'success', 'message' => ['File has been removed successfully.']]]);
    }
}
