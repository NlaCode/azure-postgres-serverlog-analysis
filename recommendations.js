var recommendationRules = [
  {
    "id": "deadlock",
    "title": "Concorrência e Deadlocks",
    "severity": "CRITICAL",
    "condition": "return errorPatternCount('deadlock detected') > 0;",
    "patterns": ["deadlock detected"],
    "description": "Foram detectados deadlocks. Isso ocorre quando duas transações se bloqueiam mutuamente. Revise a ordem em que as transações na aplicação adquirem locks (ex: SELECT FOR UPDATE ou UPDATEs em múltiplas tabelas).",
    "references": [
      { "title": "PostgreSQL — Deadlocks", "url": "https://www.postgresql.org/docs/current/explicit-locking.html#LOCKING-DEADLOCKS" },
      { "title": "PostgreSQL — Lock Management", "url": "https://www.postgresql.org/docs/current/runtime-config-locks.html" },
      { "title": "Azure — Troubleshoot high CPU", "url": "https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/how-to-high-cpu-utilization" }
    ]
  },
  {
    "id": "no_space_left",
    "title": "Disco Lotado (No space left)",
    "severity": "CRITICAL",
    "condition": "return errorPatternCount('No space left') > 0;",
    "patterns": ["No space left"],
    "description": "O servidor ficou sem espaço em disco para escrever logs, WALs ou dados temporários. Escale o storage imediatamente no portal do Azure ou limpe logs/arquivos temporários.",
    "references": [
      { "title": "Azure — Compute e Storage", "url": "https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/concepts-compute-storage#storage" },
      { "title": "PostgreSQL — WAL Configuration", "url": "https://www.postgresql.org/docs/current/wal-configuration.html" },
      { "title": "PostgreSQL — Disk Full", "url": "https://www.postgresql.org/docs/current/disk-full.html" }
    ]
  },
  {
    "id": "high_connection_churn",
    "title": "Alto Churn de Conexões",
    "severity": "WARNING",
    "condition": "return stats.conn > 100 && (stats.conn / (stats.disconn || 1) > 0.8) && (stats.conn / (stats.disconn || 1) < 1.2);",
    "patterns": [],
    "description": "Há um alto volume de conexões sendo abertas e fechadas repetidamente (semelhante número de conexões e desconexões). Isso consome muita CPU (processos fork). Implemente um connection pooler como PgBouncer.",
    "references": [
      { "title": "Azure — PgBouncer no Flexible Server", "url": "https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/concepts-pgbouncer" },
      { "title": "PostgreSQL — Connection Settings", "url": "https://www.postgresql.org/docs/current/runtime-config-connection.html" }
    ]
  },
  {
    "id": "max_connections_reached",
    "title": "Limite de Conexões Atingido",
    "severity": "CRITICAL",
    "condition": "return errorPatternCount('remaining connection slots are reserved') > 0 || errorPatternCount('too many connections') > 0;",
    "patterns": ["remaining connection slots are reserved", "too many connections"],
    "description": "O banco de dados rejeitou novas conexões pois o limite (max_connections) foi atingido. Investigue sessões ociosas ou configure um connection pooler (PgBouncer).",
    "references": [
      { "title": "PostgreSQL — max_connections", "url": "https://www.postgresql.org/docs/current/runtime-config-connection.html#GUC-MAX-CONNECTIONS" },
      { "title": "Azure — Limites de Conexão", "url": "https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/concepts-limits" },
      { "title": "Azure — PgBouncer", "url": "https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/concepts-pgbouncer" }
    ]
  },
  {
    "id": "password_auth_failed",
    "title": "Falha de Autenticação",
    "severity": "WARNING",
    "condition": "return errorPatternCount('password authentication failed') > 0;",
    "patterns": ["password authentication failed"],
    "description": "Houve tentativas de login com senha incorreta. Verifique se alguma aplicação está usando credenciais desatualizadas ou rotacionadas. Picos repentinos podem indicar tentativa de brute-force.",
    "references": [
      { "title": "PostgreSQL — Problemas de Autenticação", "url": "https://www.postgresql.org/docs/current/client-authentication-problems.html" },
      { "title": "PostgreSQL — pg_hba.conf", "url": "https://www.postgresql.org/docs/current/auth-pg-hba-conf.html" },
      { "title": "Azure — Microsoft Entra Authentication", "url": "https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/concepts-azure-ad-authentication" }
    ]
  },
  {
    "id": "statement_timeout",
    "title": "Queries Excedendo Timeout",
    "severity": "WARNING",
    "condition": "return errorPatternCount('canceling statement due to statement timeout') > 0;",
    "patterns": ["canceling statement due to statement timeout"],
    "description": "Algumas queries foram abortadas por ultrapassarem o `statement_timeout`. Verifique a aba 'Log Finder' filtrando por 'duration' ou ative o `pg_stat_statements` para identificar e otimizar queries lentas.",
    "references": [
      { "title": "PostgreSQL — statement_timeout", "url": "https://www.postgresql.org/docs/current/runtime-config-client.html#GUC-STATEMENT-TIMEOUT" },
      { "title": "PostgreSQL — pg_stat_statements", "url": "https://www.postgresql.org/docs/current/pgstatstatements.html" },
      { "title": "Azure — Query Performance Insight", "url": "https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/concepts-query-store" }
    ]
  },
  {
    "id": "ssl_unexpected_eof",
    "title": "Instabilidade de Rede (SSL EOF)",
    "severity": "INFO",
    "condition": "return errorPatternCount('unexpected eof while reading') > 0;",
    "patterns": ["unexpected eof while reading"],
    "description": "Foram observados erros de fechamento abrupto de conexão SSL. Isso geralmente indica timeouts na rede entre a aplicação e o banco, ou que a aplicação foi reiniciada de forma forçada.",
    "references": [
      { "title": "Azure — Conectar com TLS/SSL", "url": "https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/how-to-connect-tls-ssl" },
      { "title": "PostgreSQL — SSL Support", "url": "https://www.postgresql.org/docs/current/ssl-tcp.html" }
    ]
  },
  {
    "id": "datadog_permission",
    "title": "Permissão Negada - Agente Datadog",
    "severity": "WARNING",
    "condition": "return (errorPatternCount('permission denied') > 0 && errorPatternCount('datadog') > 0) || errorPatternCount('schema \"datadog\" does not exist') > 0;",
    "patterns": ["permission denied", "datadog"],
    "description": "Erros de permissão ou schema inexistente envolvendo o agente do Datadog. Certifique-se de que o usuário 'datadog' tenha recebido os privilégios corretos (ex: pg_monitor para acessar funções como pg_ls_waldir e pg_show_all_file_settings) e que o schema 'datadog' com a função explain_statement exista no banco de dados monitorado.",
    "references": [
      { "title": "Datadog — PostgreSQL Integration", "url": "https://docs.datadoghq.com/integrations/postgres/?tab=host" },
      { "title": "Datadog — Database Monitoring Setup", "url": "https://docs.datadoghq.com/database_monitoring/setup_postgres/" },
      { "title": "PostgreSQL — GRANT", "url": "https://www.postgresql.org/docs/current/sql-grant.html" }
    ]
  },
  {
    "id": "generic_permission_denied",
    "title": "Permissão Negada (Permission Denied)",
    "severity": "WARNING",
    "condition": "return errorPatternCount('permission denied') > 0 && errorPatternCount('datadog') === 0;",
    "patterns": ["permission denied"],
    "description": "Erros de 'permission denied' para usuários da aplicação. Verifique se o GRANT apropriado foi dado na tabela, view ou função afetada. Sugestão de comando: GRANT SELECT, INSERT, UPDATE ON nome_da_tabela TO nome_do_usuario;",
    "references": [
      { "title": "PostgreSQL — GRANT", "url": "https://www.postgresql.org/docs/current/sql-grant.html" },
      { "title": "PostgreSQL — Privileges", "url": "https://www.postgresql.org/docs/current/ddl-priv.html" }
    ]
  },
  {
    "id": "idle_session_timeout",
    "title": "Conexões Encerradas por Inatividade",
    "severity": "WARNING",
    "condition": "return errorPatternCount('terminating connection due to idle-session timeout') > 0;",
    "patterns": ["idle-session timeout"],
    "description": "Sessões inativas foram terminadas por excederem o tempo limite `idle_session_timeout`. Isso pode ocorrer se a aplicação retém conexões abertas sem uso. Revise o gerenciamento de conexões do seu app, garanta que transações/conexões não essenciais sejam finalizadas, ou ajuste o valor deste parâmetro na configuração do PostgreSQL se necessário.",
    "references": [
      { "title": "PostgreSQL — idle_session_timeout", "url": "https://www.postgresql.org/docs/current/runtime-config-client.html#GUC-IDLE-SESSION-TIMEOUT" },
      { "title": "PostgreSQL — idle_in_transaction_session_timeout", "url": "https://www.postgresql.org/docs/current/runtime-config-client.html#GUC-IDLE-IN-TRANSACTION-SESSION-TIMEOUT" },
      { "title": "Azure — Server Parameters", "url": "https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/concepts-server-parameters" }
    ]
  },
  {
    "id": "not_null_violation",
    "title": "Violação de Constraint (Not-Null)",
    "severity": "CRITICAL",
    "condition": "return errorPatternCount('violates not-null constraint') > 0;",
    "patterns": ["violates not-null constraint"],
    "description": "A aplicação tentou inserir ou atualizar um registro enviando um valor nulo (NULL) para uma coluna que é obrigatória (não permite nulos). Revise o código da aplicação ou a query para garantir que os campos obrigatórios, como IDs de relacionamento, estejam sendo preenchidos corretamente.",
    "references": [
      { "title": "PostgreSQL — Not-Null Constraints", "url": "https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-NOT-NULL" },
      { "title": "PostgreSQL — INSERT", "url": "https://www.postgresql.org/docs/current/sql-insert.html" }
    ]
  },
  {
    "id": "datadog_multiquery_cursor",
    "title": "Erro Datadog: Multi-query cursor",
    "severity": "INFO",
    "condition": "return errorPatternCount('cannot open multi-query plan as cursor') > 0;",
    "patterns": ["cannot open multi-query plan as cursor"],
    "description": "O agente do Datadog (ou outra ferramenta de monitoramento) tentou rodar um 'EXPLAIN' em uma instrução contendo múltiplas queries separadas por ponto-e-vírgula (;). O PostgreSQL não suporta a execução de múltiplas queries dentro de um cursor. Trata-se de um erro da coleta de métricas e geralmente pode ser ignorado, ou contornado desabilitando a funcionalidade de EXPLAIN no agente do Datadog para batches de queries.",
    "references": [
      { "title": "Datadog — Troubleshooting PostgreSQL", "url": "https://docs.datadoghq.com/database_monitoring/setup_postgres/troubleshooting/" },
      { "title": "PostgreSQL — DECLARE CURSOR", "url": "https://www.postgresql.org/docs/current/sql-declare.html" }
    ]
  },
  {
    "id": "relation_not_exist",
    "title": "Tabela ou Relação Inexistente",
    "severity": "CRITICAL",
    "condition": "var keys = Object.keys(errorGroups); for (var i = 0; i < keys.length; i++) { var p = errorGroups[keys[i]].pattern; if (p.indexOf('relation') !== -1 && p.indexOf('does not exist') !== -1) return true; } return false;",
    "patterns": ["does not exist"],
    "description": "Uma query tentou acessar uma tabela ou view que não existe. Isso pode ocorrer devido a uma falha/ausência na execução de uma migration no banco de dados, conexão com o banco de dados/schema incorreto, ou erro de digitação no código da aplicação.",
    "references": [
      { "title": "PostgreSQL — CREATE TABLE", "url": "https://www.postgresql.org/docs/current/sql-createtable.html" },
      { "title": "PostgreSQL — Schemas", "url": "https://www.postgresql.org/docs/current/ddl-schemas.html" }
    ]
  },
  {
    "id": "connection_client_lost",
    "title": "Conexão com o Cliente Perdida",
    "severity": "WARNING",
    "condition": "return errorPatternCount('connection to client lost') > 0 || errorPatternCount('could not receive data from client') > 0;",
    "patterns": ["connection to client lost", "could not receive data from client"],
    "description": "O banco de dados detectou que a conexão TCP foi encerrada abruptamente pelo cliente. Isso geralmente é causado por: a aplicação foi encerrada/crachou subitamente (ex: Out of Memory no pod da aplicação), problemas de rede (firewall/timeout), ou o timeout interno da aplicação esgotou e ela dropou a conexão sem encerrá-la amigavelmente.",
    "references": [
      { "title": "PostgreSQL — log_disconnections", "url": "https://www.postgresql.org/docs/current/runtime-config-logging.html#GUC-LOG-DISCONNECTIONS" },
      { "title": "PostgreSQL — TCP Keepalives", "url": "https://www.postgresql.org/docs/current/runtime-config-connection.html#RUNTIME-CONFIG-CONNECTION-SETTINGS" },
      { "title": "Azure — Networking Overview", "url": "https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/concepts-networking" }
    ]
  },
  {
    "id": "query_store_disabled",
    "title": "Query Store Desativado",
    "severity": "INFO",
    "condition": "return errorPatternCount('query data store as off') > 0;",
    "patterns": ["query data store as off"],
    "description": "O Query Store está desativado no servidor. O Query Store é uma ferramenta nativa do Azure PostgreSQL essencial para o monitoramento de performance e identificação de queries lentas no longo prazo. Recomenda-se ativá-lo definindo o parâmetro 'pg_qs.query_capture_mode' para 'TOP' ou 'ALL'.",
    "references": [
      { "title": "Azure - Query Store", "url": "https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/concepts-query-store" }
    ]
  },
  {
    "id": "entra_id_not_configured",
    "title": "Microsoft Entra ID (Azure AD) Não Configurado",
    "severity": "INFO",
    "condition": "return errorPatternCount('aad_tenant_id is NULL') > 0;",
    "patterns": ["aad_tenant_id is NULL"],
    "description": "O servidor não está utilizando autenticação via Microsoft Entra ID (antigo Azure AD). Configurar o Entra ID permite centralizar a gestão de identidades e habilitar políticas avançadas de segurança (como MFA) para o acesso ao banco de dados.",
    "references": [
      { "title": "Azure - Microsoft Entra authentication", "url": "https://learn.microsoft.com/en-us/azure/postgresql/flexible-server/concepts-azure-ad-authentication" }
    ]
  },
  {
    "id": "value_too_long",
    "title": "Valor Excede Tamanho da Coluna (Value Too Long)",
    "severity": "CRITICAL",
    "condition": "return errorPatternCount('value too long for type character varying') > 0;",
    "patterns": ["value too long for type character varying"],
    "description": "A aplicação tentou inserir um valor que excede o tamanho máximo definido para a coluna (ex: um campo varchar(9) recebeu uma string com mais de 9 caracteres). Isso pode indicar que o limite da coluna está subdimensionado ou que os dados não estão sendo validados/truncados antes da inserção. Revise o schema do banco (ALTER TABLE ... ALTER COLUMN ... TYPE varchar(N)) ou adicione validação na aplicação.",
    "references": [
      { "title": "PostgreSQL — Character Types", "url": "https://www.postgresql.org/docs/current/datatype-character.html" },
      { "title": "PostgreSQL — ALTER TABLE", "url": "https://www.postgresql.org/docs/current/sql-altertable.html" }
    ]
  },
  {
    "id": "unique_constraint_violation",
    "title": "Violação de Constraint Única (Duplicate Key)",
    "severity": "WARNING",
    "condition": "return errorPatternCount('duplicate key value violates unique constraint') > 0;",
    "patterns": ["duplicate key value violates unique constraint"],
    "description": "A aplicação tentou inserir ou atualizar um registro com um valor que já existe em uma coluna com constraint UNIQUE. Isso pode ser causado por retries excessivos sem idempotência, condições de corrida entre workers, ou lógica de upsert ausente. Considere usar INSERT ... ON CONFLICT (upsert) para tratar inserções duplicadas de forma graceful.",
    "references": [
      { "title": "PostgreSQL — INSERT ON CONFLICT", "url": "https://www.postgresql.org/docs/current/sql-insert.html#SQL-ON-CONFLICT" },
      { "title": "PostgreSQL — Unique Constraints", "url": "https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-UNIQUE-CONSTRAINTS" }
    ]
  }
];
