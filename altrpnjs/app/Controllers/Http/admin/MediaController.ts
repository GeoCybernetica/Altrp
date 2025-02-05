import {HttpContextContract} from '@ioc:Adonis/Core/HttpContext'
import Media from 'App/Models/Media';
import empty from '../../../../helpers/empty';
import base_path from '../../../../helpers/base_path';
import fs from 'fs'
import User from 'App/Models/User';
import is_array from '../../../../helpers/is_array';
import CategoryObject from 'App/Models/CategoryObject';
import imageSize from 'image-size'
import convert from 'heic-convert'
import {parseString} from'xml2js'
import data_get from '../../../../helpers/data_get';
import guid from '../../../../helpers/guid';
import public_path from "../../../../helpers/public_path";

export default class MediaController {
  private static fileTypes: any;
  async index({response, request}: HttpContextContract) {
    let query = Media.query().whereNull('deleted_at')
    let categories = request.qs().categories;
    let type = request.qs().type;

    if (!categories) {
      categories = []
    } else {
      categories = categories.split(',')
    }

    if (type) {
      if (type === 'other') {
        query.where(query => {
          query.where('type', type).orWhereNull('type')
        })
      } else {
        query.where('type', type)
      }
    }

    if( ! empty(categories)){
      query.leftJoin('altrp_category_objects', 'altrp_category_objects.object_guid', '=', 'altrp_media.guid')
        .whereIn('altrp_category_objects.category_guid', categories)
    }

    let media:any[] = await (query.orderBy('id','desc').select('altrp_media.*').preload('categories'))


    media = media.map(model => {
      return model.serialize()
    })

    return response.json(media)
  }

  public static  getFileTypes() {
    if (!MediaController.fileTypes) {
      let fileTypes = fs.readFileSync(base_path('config/file-types.json'), {encoding:'utf8'});
      fileTypes = JSON.parse(fileTypes);
      MediaController.fileTypes = fileTypes;
    }
    return MediaController.fileTypes;
  }
  static getTypeForFile(file){

    let extensionLoaded = file.extname.split('.').pop();

    let type = '';
    let file_types = MediaController.getFileTypes();
    for (let file_type of file_types ){
      if( ( ! type ) &&   file_type.extensions.indexOf(extensionLoaded) !== -1 ){
        type = file_type.name;
      }
    }
    if( ! type ){
      type = 'other';
    }
    return type;
  }

  async store({response, request, auth}: HttpContextContract){
    // @ts-ignore
    const user: User|null = auth.user
    if(! user){
      return response.status(403).json({success: false, message:'not allowed'})
    }
    const files = request.files('files')
    let res:Media[] = []
    for(let file of files){
      if(! file){
        continue
      }
      // @ts-ignore
      const ext = file.extname.split('.').pop()
      let media = new Media();
      media.title = file.clientName;
      media.media_type = file.type || '';
      media.author = user.id;
      media.type = MediaController.getTypeForFile( file );
      media.guid = guid();
      const date = new Date
      let filename = media.guid + '.' + ext
      let urlBase = '/media/' +
        date.getFullYear() + '/' +
        (date.getMonth() + 1)  +'/'
      let dirname = public_path('/storage'+urlBase)
      if(! fs.existsSync(dirname)){
        fs.mkdirSync(dirname, {recursive:true})
      }
      media.filename = urlBase + filename
      // @ts-ignore
      await file.moveToDisk( dirname,{name : filename}, 'local' );
      let content = fs.readFileSync(dirname+filename)

      if (ext == 'heic') {
        media.title = file.clientName.split('.')[0] + '.jpg';
        media.media_type = 'image/jpeg';
        media.type = 'image';
        content = convert({
          buffer: content,
          format: 'JPEG',
          quality: 1 })
        fs.writeFileSync(dirname+filename, content)
      }

      if( ext === 'svg' ){
        let svg = content
        svg = parseString( svg );
        media.width = data_get( svg, '$.width', 150 );
        media.height =  data_get( svg, '$.height', 150 );
      } else {
        let dimensions ;
        try{
          dimensions = imageSize( content );
        }catch (e) {

        }
        media.width = data_get( dimensions, 'width', 0 );
        media.height = data_get( dimensions, 'height', 0 );
      }
      media.main_color = ''
      media.url =  '/storage'+urlBase+ filename;
      media.save();

      const categories = request.input( '_categories' );
      if( is_array(categories) && categories.length > 0 && media.guid){
        let insert:any[] = [];
        for(let category of categories ){
          insert.push( {
            category_guid: category['value'],
            object_guid: media.guid,
            object_type: 'Media'
          });
        }
        await CategoryObject.createMany(insert);
      }
      res.push(media)
    }
    res = res.reverse()
    return response.json( res );
  }

  async destroy({params, response}: HttpContextContract){
    const media = await Media.find(params.id)
    if(! media){
      return response.status(404).json({success: false, message:'Media not found'})
    }
    let filename = public_path('/storage'+media.filename)
    if(fs.existsSync(filename)){
      fs.rmSync(filename)
    }
    await media?.delete()
    return response.json({success: true, })
  }
}
