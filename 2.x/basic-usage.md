# Основное применение

Во-первых, начните с создания простого класса PHP, который выполняет Вашу задачу. Ради этого руководства давайте создадим простой класс, который обновляет пароль пользователя.

Вы можете организовать эти действия как хотите. Лично я предпочитаю размещать их в папке `app/Actions` или - если мое приложение разделено на модули - в `app/MyModule/Actions`.

```php
namespace App\Authentication\Actions;

class UpdateUserPassword
{
    public function handle(User $user, string $newPassword)
    {
        $user->password = Hash::make($newPassword);
        $user->save();
    }
}
```

Затем добавьте в свой класс трейт `AsAction`. Это позволит Вам использовать этот класс как **an object**, **a controller**, **a job**, **a listener**, **a command** и даже как **a fake** экземпляр для тестирования и имитации.

```php
namespace App\Authentication\Actions;

use Lorisleiva\Actions\Concerns\AsAction;

class UpdateUserPassword
{
    use AsAction;

    public function handle(User $user, string $newPassword)
    {
        $user->password = Hash::make($newPassword);
        $user->save();
    }
}
```

## Запуск как объект

Трейт `AsAction` предоставляет несколько методов, которые помогут Вам разрешить класс из контейнера и выполнить его.

```php
// Эквивалентно "app(UpdateUserPassword::class)".
UpdateUserPassword::make();

// Эквивалентно "UpdateUserPassword::make()->handle($user, 'secret')".
UpdateUserPassword::run($user, 'secret');
```

## Запуск в качестве контроллера

Теперь давайте воспользуемся нашим экшеном в качестве контроллера. Во-первых, нам нужно зарегистрировать его в нашем файле маршрутов, как если бы мы регистрировали любой вызываемый контроллер.

```php
Route::put('auth/password', UpdateUserPassword::class)->middleware('auth');
```

Затем все, что нам нужно сделать, это реализовать метод `asController`, чтобы мы могли преобразовывать данные запроса в аргументы, ожидаемые нашим экшеном - в данном случае объект пользователя и пароль.

```php
class UpdateUserPassword
{
    use AsAction;

    public function handle(User $user, string $newPassword)
    {
        $user->password = Hash::make($newPassword);
        $user->save();
    }

    public function asController(Request $request)
    {
        $this->handle(
            $request->user(), 
            $request->get('password')
        );

        return redirect()->back();
    }
}
```

И точно так же Вы используете свой собственный класс PHP в качестве контроллера. Но как насчет авторизации и проверки? Разве мы не должны убедиться, что новый пароль был подтвержден, а старый пароль предоставлен? Конечно, давай сделаем это.

## Добавление проверки контроллера

Вместо того, чтобы внедрять обычный класс `Request`, мы можем либо внедрить собственный класс `FormRequest`, либо добавить класс `ActionRequest`, который будет использовать само действие для разрешения авторизации и проверки.

```php
use Lorisleiva\Actions\Concerns\AsAction;
use Lorisleiva\Actions\ActionRequest;
use Illuminate\Validation\Validator;

class UpdateUserPassword
{
    use AsAction;

    // ...

    public function rules()
    {
        return [
            'current_password' => ['required'],
            'password' => ['required', 'confirmed'],
        ];
    }

    public function withValidator(Validator $validator, ActionRequest $request)
    {
        $validator->after(function (Validator $validator) use ($request) {
            if (! Hash::check($request->get('current_password'), $request->user()->password)) {
                $validator->errors()->add('current_password', 'Текущий пароль не совпадает.');
            }
        });
    }

    public function asController(ActionRequest $request)
    {
        $this->handle(
            $request->user(), 
            $request->get('password')
        );

        return redirect()->back();
    }
}
```

Вот и все! Теперь, когда мы достигаем метода `asController`, мы точно знаем, что проверка прошла успешно, и мы можем получить доступ к проверенным данным с помощью `$request->validated()`, как мы привыкли.

## Запуск как команда

Прежде чем завершить это руководство, давайте посмотрим, как мы можем запустить наше действие как команду.

Подобно тому, что мы делали ранее, нам просто нужно реализовать метод `asCommand` для преобразования наших аргументов и параметров командной строки в объект пользователя и пароль. Этот метод принимает в качестве аргумента команду `Command`, которая может использоваться как для чтения ввода, так и для записи вывода.

Кроме того, нам необходимо предоставить подпись и описание команды через свойства `$commandSignature` и `$commandDescription`.

```php
class UpdateUserPassword
{
    use AsAction;

    public string $commandSignature = 'user:update-password {user_id} {password}';
    public string $commandDescription = 'Обновляет пароль пользователя.';

    public function asCommand(Command $command)
    {
        $user = User::findOrFail($command->argument('user_id'));

        $this->handle($user, $command->argument('password'));

        $command->line(sprintf('Пароль обновлен для %s.', $user->name));
    }

    // ...
}
```

Теперь мы можем зарегистрировать его в нашей консоли `Kernel` вот так:

```php
namespace App\Console;

class Kernel extends ConsoleKernel
{
    protected $commands = [
        UpdateUserPassword::class,
    ];
    
    // ...
}
```

## Следующие шаги

Надеюсь, этот небольшой учебник помог увидеть, что может Вам дать этот пакет. Помимо контроллеров и команд, Laravel Actions также поддерживает задания и слушателей, следуя тем же соглашениям - путем реализации методов `asJob` и `asListener`.

А еще лучше **Ваш собственный класс PHP никогда не используется напрямую в качестве контроллера, задания, команды или слушателя**. Вместо этого он оборачивается соответствующим декоратором в зависимости от того, от чего он запущен. Это означает, что Вы полностью контролируете свои действия и Вам не нужно беспокоиться о конфликтах между шаблонами (смотрите "[Как это работает?](./how-does-it-work)").

Если Вам нравится учиться, читая код, раздел "[Учиться на примерах](./examples/generate-reservation-code)" для Вас. В каждом примере представлен код одного действия, как оно используется или регистрируется, а также краткое описание, объясняющее его цель.

Не забудьте также проверить разделы "[Руководство](./one-class-one-task)" и "[Ссылки](./as-object)", чтобы получить больше информации о том, что Вы можете делать с действиями, и для ссылки вернуться к доступным Вам методам.
