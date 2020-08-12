<?php

namespace App\Observers;

use App\Altrp\Generators\Controller\ControllerFile;
use App\Altrp\Generators\Controller\ControllerFileWriter;
use App\Altrp\Generators\Repository\RepositoryFile;
use App\Altrp\Generators\Repository\RepositoryInterfaceFile;
use App\Altrp\Generators\Route\RouteFile;
use App\Altrp\Generators\Route\RouteFileWriter;
use App\Altrp\Model;
use App\Altrp\Source;
use App\Altrp\SourcePermission;
use App\Exceptions\Controller\ControllerFileException;
use App\Permission;
use App\SQLEditor;
use Carbon\Carbon;
use Illuminate\Support\Str;

class AltrpSQLEditorObserver
{
    /**
     * Handle the s q l editor "creating" event.
     *
     * @param \App\SQLEditor $sQLEditor
     * @return void
     * @throws ControllerFileException
     */
    public function creating(SQLEditor $sQLEditor)
    {
        $model = Model::find($sQLEditor->model_id);
        $controllerFile = new ControllerFile($model);
        $repo = new RepositoryFile($model);
        $repoInterface = new RepositoryInterfaceFile($model);
        $controllerWriter = new ControllerFileWriter(
            $controllerFile,
            $repo,
            $repoInterface
        );
        if ($controllerWriter->methodSqlExists($sQLEditor->name)) {
            throw new ControllerFileException('Method already exists', 500);
        }
        $controllerWriter->writeSqlMethod($sQLEditor->name, $sQLEditor->sql);
    }

    /**
     * Handle the s q l editor "created" event.
     *
     * @param \App\SQLEditor $sQLEditor
     * @return void
     * @throws ControllerFileException
     * @throws \App\Exceptions\Route\RouteFileException
     */
    public function created(SQLEditor $sQLEditor)
    {
        $model = Model::find($sQLEditor->model_id);
        $controllerFile = new ControllerFile($model);
        $permission = Permission::where('name', 'sql-editor-' . $sQLEditor->name)->first();
        if (! $permission) {
            $permission = new Permission([
                'name' => 'sql-editor-' . $sQLEditor->name,
                'display_name' => 'SQL Editor ' . Str::studly($sQLEditor->name),
                'created_at' => Carbon::now()
            ]);
            $permission->save();
        }
        $source = Source::where('type',Str::snake($sQLEditor->name))->first();
        if (! $source) {
            $source = new Source([
                'model_id' => $sQLEditor->model_id,
                'controller_id' => $model->altrp_controller->id,
                'url' => '/' . strtolower(Str::plural($model->name)) . '/{sql_builder}',
                'api_url' => '/' . strtolower(Str::plural($model->name)) . '/{sql_builder}',
                'type' => Str::snake($sQLEditor->name),
                'name' => 'SQL Editor ' . Str::studly($sQLEditor->name)
            ]);
            $source->save();
        }
        $sourcePermission = SourcePermission::where([
            ['permission_id',$permission->id],
            ['source_id',$source->id]
        ])->first();
        if (! $sourcePermission) {
            $sourcePermission = new SourcePermission([
                'type' => 'sql-editor-'.Str::kebab($sQLEditor->name),
                'permission_id' => $permission->id,
                'source_id' => $source->id
            ]);
            $sourcePermission->save();
        }
        $routeFile = new RouteFile($model);
        $routeWriter = new RouteFileWriter($routeFile, $controllerFile);
        $routeWriter->addRoute($sQLEditor->name);
    }

    /**
     * Handle the s q l editor "updating" event.
     *
     * @param \App\SQLEditor $sQLEditor
     * @return void
     * @throws ControllerFileException
     * @throws \App\Exceptions\Route\RouteFileException
     */
    public function updating(SQLEditor $sQLEditor)
    {
        $model = Model::find($sQLEditor->model_id);
        $controllerFile = new ControllerFile($model);
        $repo = new RepositoryFile($model);
        $repoInterface = new RepositoryInterfaceFile($model);
        $controllerWriter = new ControllerFileWriter(
            $controllerFile,
            $repo,
            $repoInterface
        );
        if ($controllerWriter->methodSqlExists($sQLEditor->name)
            && $sQLEditor->getOriginal('name') != $sQLEditor->name) {
            throw new ControllerFileException('Method already exists', 500);
        }
        $controllerWriter->updateSqlMethod(
            $sQLEditor->getOriginal('name'),
            $sQLEditor->name,
            $sQLEditor->sql
        );
    }

    /**
     * Handle the s q l editor "updated" event.
     *
     * @param \App\SQLEditor $sQLEditor
     * @return void
     * @throws ControllerFileException
     * @throws \App\Exceptions\Route\RouteFileException
     */
    public function updated(SQLEditor $sQLEditor)
    {
        $model = Model::find($sQLEditor->model_id);
        $controllerFile = new ControllerFile($model);
        $permission = Permission::where('name', 'sql-editor-' . $sQLEditor->getOriginal('name'));
        $permission->update([
            'name' => 'sql-editor-' . $sQLEditor->name,
            'display_name' => 'SQL Editor ' . Str::studly($sQLEditor->name),
            'updated_at' => Carbon::now()
        ]);
        $source = Source::where('type',Str::snake($sQLEditor->getOriginal('name')));
        $source->update([
            'model_id' => $sQLEditor->model_id,
            'controller_id' => $model->altrp_controller->id,
            'url' => '/' . strtolower(Str::plural($model->name)) . '/{sql_builder}',
            'api_url' => '/' . strtolower(Str::plural($model->name)) . '/{sql_builder}',
            'type' => Str::snake($sQLEditor->name),
            'name' => 'SQL Editor ' . Str::studly($sQLEditor->name)
        ]);
        $permission = Permission::where('name', 'sql-editor-' . $sQLEditor->name)->first();
        $source = Source::where('type',Str::snake($sQLEditor->name))->first();
        if ($source && $permission) {
            $sourcePermission = SourcePermission::where([
                ['permission_id',$permission->id],
                ['source_id',$source->id]
            ]);
            if ($sourcePermission->first()) {
                $sourcePermission->update(['type' => 'sql-editor-'.Str::kebab($sQLEditor->name)]);
            }
        }
        $routeFile = new RouteFile($model);
        $routeWriter = new RouteFileWriter($routeFile, $controllerFile);
        $routeWriter->updateSqlRoute($sQLEditor->getOriginal('name'),$sQLEditor->name);
    }

    /**
     * Handle the s q l editor "deleting" event.
     *
     * @param  \App\SQLEditor  $sQLEditor
     * @return void
     */
    public function deleting(SQLEditor $sQLEditor)
    {
        //
    }

    /**
     * Handle the s q l editor "deleted" event.
     *
     * @param  \App\SQLEditor  $sQLEditor
     * @return void
     */
    public function deleted(SQLEditor $sQLEditor)
    {
        //
    }

    /**
     * Handle the s q l editor "restored" event.
     *
     * @param  \App\SQLEditor  $sQLEditor
     * @return void
     */
    public function restored(SQLEditor $sQLEditor)
    {
        //
    }

    /**
     * Handle the s q l editor "force deleted" event.
     *
     * @param  \App\SQLEditor  $sQLEditor
     * @return void
     */
    public function forceDeleted(SQLEditor $sQLEditor)
    {
        //
    }
}