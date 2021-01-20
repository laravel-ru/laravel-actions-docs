---
sidebarDepth: 2
---

# Как задание

## Предоставляемый метод
*Перечисляет все методы, предоставляемые трейтом.*

### `dispatch`
Асинхронно отправляет задание.

```php
SendTeamReportEmail::dispatch($team);
```

### `dispatchIf`
Асинхронно отправляет задание, если условие выполнено.

```php
SendTeamReportEmail::dispatchIf($team->plan === 'premium', $team);
```

### `dispatchUnless`
Асинхронно отправляет задание, если не выполняется условие.

```php
SendTeamReportEmail::dispatchUnless($team->plan === 'free', $team);
```

### `dispatchSync`
Отправляет задание синхронно.

```php
SendTeamReportEmail::dispatchSync($team);
```

### `dispatchNow`
Отправляет задание синхронно. (Псевдоним `dispatchSync`).

```php
SendTeamReportEmail::dispatchNow($team);
```

### `dispatchAfterResponse`
Отправляет задание синхронно, но только после того, как ответ был отправлен пользователю.

```php
SendTeamReportEmail::dispatchAfterResponse($team);
```

### `makeJob`
Создает новый объект `JobDecorator`, который обертывает действие. Это может быть использовано для отправки задания с помощью вспомогательного метода `dispatch` или при создании цепочки заданий из действий (смотрите `withChain`).

```php
dispatch(SendTeamReportEmail::makeJob($team));
```

### `makeUniqueJob`
Создает новый объект `UniqueJobDecorator`, который обертывает действие. По умолчанию `makeJob` автоматически возвращает уникальный объект `UniqueJobDecorator` , если Ваше действие реализует трейт `ShouldBeUnique`. Однако Вы можете использовать этот метод напрямую для принудительного создания `UniqueJobDecorator`.

```php
dispatch(SendTeamReportEmail::makeUniqueJob($team));
```

### `withChain`
Прикрепляет список заданий, которые должны быть выполнены после обработки задания.

```php
$chain = [
    OptimizeTeamReport::makeJob($team),
    SendTeamReportEmail::makeJob($team),
];

CreateNewTeamReport::withChain($chain)->dispatch($team);
```

Обратите внимание, что Вы можете достичь того же результата, используя метод цепочки на Bus Facade.

```php
use Illuminate\Support\Facades\Bus;

Bus::chain([
    CreateNewTeamReport::makeJob($team),
    OptimizeTeamReport::makeJob($team),
    SendTeamReportEmail::makeJob($team),
])->dispatch();
```

### `assertPushed`
Утверждает, что действие было отправлено.

```php
// Требуется, чтобы фасад очереди был поддельным.
Queue::fake();

// Подтвердите, что задание было отправлено.
SendTeamReportEmail::assertPushed();

// Утверждаю, что задание было отправлено 3 раза.
SendTeamReportEmail::assertPushed(3);

// Утверждение, что задание, удовлетворяющее данному обратному вызову, было отправлено.
SendTeamReportEmail::assertPushed($callback);

// Утвердить задание, удовлетворяющее данному обратному вызову, было отправлено 3 раза.
SendTeamReportEmail::assertPushed(3, $callback);
```

Обратный вызов получит следующие четыре аргумента:

1. Само действие. Здесь это будет экземпляр SendTeamReportEmail.
2. Аргументы задания. То есть аргументы, которые Вы указали при вызове SendTeamReportEmail::dispatch(...).
3. The JobDecorator, украшающий Ваше действие.
4. Имя использованной очереди.

### `assertNotPushed`
Утверждает, что действие не было отправлено. Аргументы обратного вызова смотрите в `assertPushed`.

```php
// Требуется, чтобы фасад очереди был поддельным.
Queue::fake();

// Подтвердите, что задание не было отправлено.
SendTeamReportEmail::assertNotPushed();

// Утверждение, что задание, удовлетворяющее данному обратному вызову, не было отправлено.
SendTeamReportEmail::assertNotPushed($callback);
```

### `assertPushedOn`
Утверждает, что действие было отправлено в заданную очередь. Аргументы обратного вызова смотрите в `assertPushed`.

```php
// Требуется, чтобы фасад очереди был поддельным.
Queue::fake();

// Подтвердите, что задание было отправлено в очередь 'reports'.
SendTeamReportEmail::assertPushedOn('reports');

// Подтвердите, что задание было отправлено в очередь 'reports' 3 раза.
SendTeamReportEmail::assertPushedOn('reports', 3);

// Утверждение, что задание, удовлетворяющее данному обратному вызову, было отправлено в очередь 'reports'.
SendTeamReportEmail::assertPushedOn('reports', $callback);

// Утверждение, что задание, удовлетворяющее данному обратному вызову, было отправлено в очередь 'reports' 3 раза.
SendTeamReportEmail::assertPushedOn('reports', 3, $callback);
```

## Используемый метод
*Перечисляет все методы и свойства, распознаваемые и используемые `JobDecorator`.*

### `asJob`
Вызывается при отправке как задание. Использует метод `handle` напрямую, когда метод `asJob` не существует.

```php
class SendTeamReportEmail
{
    use AsAction;

    public function handle(Team $team, bool $fullReport = false): void
    {
        // Подготовьте отчет и отправьте его всем пользователям $team->users.
    }

    public function asJob(Team $team): void
    {
        $this->handle($team, true);
    }
}
```

### `getJobMiddleware`
Добавляет мидлвар задания прямо в действие.

```php
public function getJobMiddleware(): array
{
    return [new RateLimited('reports')];
}
```

### `configureJob`
Определяет параметр `JobDecorators` прямо в действии.

```php
use Lorisleiva\Actions\Decorators\JobDecorator;

public function configureJob(JobDecorator $job): void
{
    $job->onConnection('my_connection')
        ->onQueue('my_queue')
        ->through(['my_middleware'])
        ->chain(['my_chain'])
        ->delay(60);
}
```

### `$jobConnection`
Определяет подключение `JobDecorator`. Также можно установить с помощью `configureJob`.

```php
public string $jobConnection = 'my_connection';
```

### `$jobQueue`
Определяет очередь `JobDecorator`. Также можно установить с помощью `configureJob`.

```php
public string $jobQueue = 'my_queue';
```

### `$jobTries`
Определяет количество попыток выполнения задания.

```php
public int $jobTries = 10;
```

### `$jobMaxExceptions`
Определяет максимальное количество разрешенных исключений перед ошибкой.

```php
public int $jobMaxExceptions = 3;
```

### `$jobBackoff`
Определяет количество секунд ожидания перед повторной попыткой выполнения задания. Также может быть установлен метод `getJobBackoff`.

```php
public int $jobBackoff = 60;
```

### `getJobBackoff`
Определяет количество секунд ожидания перед повторной попыткой выполнения задания.

```php
public function getJobBackoff(): int
{
    return 60;
}
```

Вы также можете предоставить массив, чтобы обеспечить разные откаты для каждой попытки.

```php
public function getJobBackoff(): array
{
    return [30, 60, 120];
}
```

### `$jobTimeout`
Определяет количество секунд, в течение которых задание может выполняться до истечения времени ожидания.

```php
public int $jobTimeout = 60 * 30;
```

### `$jobRetryUntil`
Определяет отметку времени, при которой задание должно завершиться по таймауту. Также может быть установлен метод `getJobRetryUntil`.

```php
public int $jobRetryUntil = 1610191764;
```

### `getJobRetryUntil`
Определяет время ожидания задания.

```php
public function getJobRetryUntil(): DateTime
{
    return now()->addMinutes(30);
}
```

### `getJobDisplayName`
Настраивает отображаемое имя `JobDecorator`. Он предоставляет те же аргументы, что и метод `asJob`.

```php
public function getJobDisplayName(): string
{
    return 'Send team report email';
}
```

### `getJobTags`
Добавляет теги в `JobDecorator`. Он предоставляет те же аргументы, что и метод `asJob`.

```php
public function getJobTags(Team $team): array
{
    return ['report', 'team:'.$team->id];
}
```

### `getJobUniqueId`
Определяет уникальный ключ при использовании интерфейса `ShouldBeUnique`. Он предоставляет те же аргументы, что и метод `asJob`.

```php
public function getJobUniqueId(Team $team)
{
    return $this->team->id;
}
```

### `$jobUniqueId`
То же, что и `getJobUniqueId`, но как свойство.

```php
public string $jobUniqueId = 'some_static_key';
```

### `getJobUniqueFor`
Определите количество времени, в течение которого задание должно оставаться уникальным при использовании интерфейса `ShouldBeUnique`. Он предоставляет те же аргументы, что и метод `asJob`.

```php
public function getJobUniqueFor(Team $team)
{
    return $this->team->role === 'premium' ? 1800 : 3600;
}
```

### `$jobUniqueFor`
То же, что и `getJobUniqueFor`, но как свойство.

```php
public int $jobUniqueFor = 3600;
```

### `getJobUniqueVia`
Определяет драйвер кеша, который будет использоваться для получения блокировки и, следовательно, для поддержания уникальности отправляемых заданий. По умолчанию: драйвер кеша по умолчанию.

```php
public function getJobUniqueVia()
{
    return Cache::driver('redis');
}
```
