# Создание новой статьи

## Определение

Создает новую статью для данного пользователя с заданными данными. Он использует аутентифицированного пользователя при использовании в качестве контроллера и обеспечивает некоторую настраиваемую авторизацию и проверку.

```php
class CreateNewArticle
{
    use AsAction;

    public function handle(User $author, array $data): Article
    {
        return $author->articles()->create($data);
    }

    public function getControllerMiddleware(): array
    {
        return ['auth'];
    }

    public function authorize(ActionRequest $request): bool
    {
        return in_array($request->user()->role, ['author', 'admin']);
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'min:8'],
            'body' => ['required', IsValidMarkdown::class],
            'published' => ['required', 'boolean'],
        ];
    }

    public function asController(ActionRequest $request): Article
    {
        $data = $request->only('title', 'body');
        $data['published_at'] = $request->get('published') ? now() : null;

        return $this->handle($request->user(), $data);
    }
}
```

## Использование в качестве объекта

Обратите внимание, как мы можем использовать это действие по-разному в зависимости от того, как оно выполняется. Внутри мы можем позволить себе определять настраиваемую дату публикации, в то время как мы разрешаем только логическое значение `published` для внешнего мира.

```php
CreateNewArticle::run($author, [
    'title' => 'My article',
    'body' => '# My article',
    'published_at' => now()->addWeek(),
])
```

Также важно отметить, что логика авторизации и проверки будет применяться к действию, только когда оно выполняется как контроллер.

## Регистрация в качестве контроллера

Чтобы использовать его в качестве контроллера, просто зарегистрируйте действие в файле маршрутов.

```php
Route::post('articles', CreateNewArticle::class);
```
