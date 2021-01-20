# Экспорт пользовательских данных

## Определение

Извлекает все пользовательские данные в файл JSON и отправляет его пользователю по электронной почте.

```php
class ExportUserData
{
    use AsAction;

    public function handle(User $user): void
    {
        // Извлекайте и храните пользовательские данные в виде файла JSON.
        $content = json_encode($this->getAllUserData($user));
        $path = sprintf('user_exports/%s.json', $user->id);
        Storage::disk('s3')->replace($path, $content);

        // Отправить временный URL-адрес файла JSON по электронной почте.
        Mail::to($user)->send(new UserDataExportReady($user, $path));
    }

    protected function getAllUserData(User $user): array
    {
        return [
            'profile' => $user->toArray(),
            'articles' => $user->articles->toArray(),
        ]
    }
}
```

## Использование в качестве объекта

```php
ExportUserData::run($user);
```

## Использование в качестве асинхронного задания

Вы можете использовать статический метод `dispatch` вместо `run` для отправки действий как асинхронного задания.

Обратите внимание, что здесь мы не реализовали метод `asJob`, так как он был бы точно таким же, как метод `handle`. В общем, когда не определен метод `asX`, вместо него используется метод `handle`.

```php
ExportUserData::dispatch($user)->onQueue('my_queue');
```

Если Вы предпочитаете определять очередь - или любые другие параметры задания - непосредственно в действии, Вы можете сделать это с помощью метода `configureJob`.

```php
use Lorisleiva\Actions\Decorators\JobDecorator;

class ExportUserData
{
    use AsAction;

    public function configureJob(JobDecorator $job): void
    {
        $job->onConnection('my_connection')
            ->onQueue('my_queue')
            ->through(['my_middleware'])
            ->chain(['my_chain'])
            ->delay(60);
    }

    // ...
}
```

## Использование в качестве синхронного задания

Вы можете использовать метод `dispatchNow` для отправки действия как синхронного задания.

Обратите внимание, что это эквивалентно использованию действия как объекта с помощью метода `run`.

```php
ExportUserData::dispatchNow($user);
```
